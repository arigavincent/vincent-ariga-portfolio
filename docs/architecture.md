# Architecture notes

A running log of the decisions behind this repo and the trade-offs that came with them.

## Shape

```
browser ──> frontend (React + Vite, static build) ──/api──> backend (Spring Boot) ──> PostgreSQL
```

- **Monorepo.** `backend/` and `frontend/` ship independently (Railway/Render and Vercel) but live
  together so one PR can change the API and its consumer.
- **Modular monolith.** One Spring Boot application with clean layers. A portfolio does not need
  microservices; the layering keeps it easy to read and test.

## Decisions

| Decision | Why | Trade-off |
| --- | --- | --- |
| Gradle (Kotlin DSL), wrapper pinned to 8.14 | Typed build scripts, fast incremental builds | Slower first build than Maven while the wrapper downloads |
| Spring Boot 3.5.x on Java 21 | Latest stable 3.x line, LTS JDK | 3.x is in maintenance; moving to 4.x is a later, separate upgrade |
| Spotless + palantir-java-format | One formatter, enforced in `./gradlew build` | Formatting is not negotiable per file |
| Tailwind CSS v4 with CSS-first tokens | The palette is defined once in `frontend/src/styles/tokens.css` and is both the Tailwind theme and the CSS variables | Needs modern browsers (Safari 16.4+, Chrome 111+) |
| Tailwind default palette removed | Components cannot use a colour outside the A&J palette | Every shade must be added to the token file first |
| TypeScript 6.0 (not 7) | `typescript-eslint` type-aware linting does not support 7 yet | Revisit when the lint tooling catches up |
| Self-hosted variable fonts (Fontsource) | No Google CDN, no third-party requests | Fonts count against the bundle size budget |

## Backend layout

```
com.arigavincent.portfolio
├── config       Typed app properties, JPA auditing, OpenAPI, web config
├── controller   Public REST endpoints (thin: delegate to services)
│   └── admin    Admin endpoints; CrudController is the shared base
├── security     Security filter chain, JWT, refresh tokens, admin bootstrap
├── ratelimit    @RateLimited annotation, interceptor and token buckets
├── storage      StorageService abstraction and the local disk implementation
├── service      Transactions and business rules
├── repository   Spring Data JPA repositories
├── entity       JPA entities and enums
├── dto          API request/response records
├── mapper       MapStruct entity <-> DTO mappers
├── exception    Domain exceptions and the global handler
└── seed         Starter content, applied to empty tables on startup
```

| Decision | Why | Trade-off |
| --- | --- | --- |
| Flyway migrations in portable SQL | The same scripts run on PostgreSQL and on H2 in PostgreSQL mode | No Postgres-only types (`jsonb`, arrays); lists are stored in child tables |
| Tests on H2 by default, plus a CI job on real PostgreSQL | Fast tests with no Docker needed locally, while CI still proves the migrations and queries on the production database | Two database engines to keep compatible |
| MapStruct for mapping, unmapped fields are compile errors | A forgotten field fails the build instead of silently returning `null` | Annotation processing adds a little build time |
| Lombok on entities only, records for DTOs | Entities stay readable; DTOs are immutable | Lombok is one more annotation processor |
| Generic `CrudService` / `CrudController` / `CrudMapper` | Six content types share one implementation of list, read, create, update and delete; a new type is three small classes | A small amount of generics, plus `validate` / `beforeSave` hooks for type-specific rules |
| One `ApiError` shape from a single `@RestControllerAdvice` | Clients handle one error format, including Spring MVC's own errors | Spring's `ProblemDetail` format is not used |
| Seed runner fills empty tables only | Safe to leave enabled: admin edits are never overwritten | Changing seed copy later does not update an existing database |

## Frontend layout

```
frontend/src
├── app          App shell: providers, router, query client
├── api          Typed client (request, ApiError), DTO types, query definitions
├── components
│   ├── ui       Reusable building blocks: Button, Magnetic, TiltCard, Reveal, SplitText, Marquee...
│   └── layout   Header, mobile menu, footer, preloader, cursor, smooth scroll, page transitions
├── features     Page sections grouped by area (home, projects) and the 3D scene
├── pages        One component per route
├── hooks        Shared hooks (media queries, scrolling, settings, boot state)
├── lib          Framework-free helpers (class names, formatting, loading registry, GSAP setup)
└── styles       tokens.css (the palette and scales) and index.css (base styles, utilities)
```

| Decision | Why | Trade-off |
| --- | --- | --- |
| Motion for component animation, GSAP + ScrollTrigger for scroll-driven scenes | Motion handles enter/exit, springs and in-view reveals declaratively; GSAP is the better tool for scrubbed timelines | Two animation libraries in the bundle |
| Lenis driven by GSAP's ticker | Smooth scrolling, ScrollTrigger and animations advance on the same frame | Lenis must be mounted before the ticker is attached (see `SmoothScroll`) |
| Preloader progress comes from a small loading registry | The counter reflects real work (fonts, first API data, later the 3D scene), and a failed request still completes so the page never sticks | Progress is weighted, not byte-accurate |
| Built-in fallback identity (`lib/site.ts`) | If the API is unreachable the site still shows who I am and how to reach me | The fallback has to be kept in step with the seed |
| One `QueryContent` component for loading, error, empty and loaded states | Every list behaves the same way and offers a retry | Slightly less control per section |
| `prefers-reduced-motion` handled centrally | `MotionConfig`, a CSS rule, and opting out of Lenis and the custom cursor cover every animation | Reduced-motion users get a simpler, static site |
| The styleguide route exists only in development | A living reference without shipping it to visitors | It is not visible on the deployed site |

## 3D scene and scroll storytelling

The home page sits on a fixed WebGL canvas (`features/scene`). One original composition, a liquid
metal core in a wireframe cage with orbit rings, crystal shards and dust, is re-posed as the page
scrolls.

```
scroll position ──ScrollTrigger (scrub)──> GSAP timeline ──writes──> sceneState (plain object)
                                                                          │ read every frame
pointer position ─────────────────────────────────────────────────> SceneContents (useFrame)
```

- `poses.ts` holds one pose per section (core position and scale, morph amount, ring spread,
  camera, glow colour and energy, layer opacity). `stops.ts` turns measured section positions
  into points on a timeline, and `useSceneScroll` rebuilds that timeline whenever the page height
  changes.
- `sceneState` is deliberately outside React: it changes every frame and must never re-render.
- Colours are read from the design tokens at runtime (`lib/tokens.ts`), so the scene uses the same
  palette as the rest of the site without hardcoding it.

| Decision | Why | Trade-off |
| --- | --- | --- |
| The canvas is lazy-loaded and only on the home page | Three.js (about 285 kB gzipped) stays out of the first bundle and off pages that do not use it | The scene appears a moment after the shell on slow connections; the preloader covers it |
| Device tiers: `none`, `low`, `high` | Reduced motion or no WebGL gets the CSS backdrop; phones and modest hardware get fewer pieces, no post-processing and a lower pixel ratio | Three code paths to keep looking good |
| `PerformanceMonitor` drops bloom and pixel ratio when frames slow down | The scene degrades instead of stuttering on integrated graphics | Visual quality can change during a session |
| Pixel ratio clamped to 1.5 (1.25 on low tier) | Retina screens would otherwise render four times the pixels for little visible gain | Slightly softer edges on high-density displays |
| Procedural environment lighting (`Lightformer`) and a generated glow texture | Reflections and glow with zero downloaded assets | Less realistic than an HDRI |
| Poses keep the core in each section's empty space and lower the layer's opacity behind text | Text stays readable over a moving background | The scene is subtler outside the hero and contact sections |
| Three.js pinned to 0.182.0 | React Three Fiber 9 still uses `THREE.Clock`, which logs a deprecation warning on every page load from r183 | Revisit when R3F moves to `THREE.Timer` |

## Security

| Decision | Why | Trade-off |
| --- | --- | --- |
| Access token: HS256 JWT, 15 minutes, sent as a `Bearer` header | Stateless and short-lived; the SPA keeps it in memory only, so XSS cannot read it from storage | A page reload needs a refresh call |
| Refresh token: opaque, random, stored as a SHA-256 hash, in an `HttpOnly` cookie scoped to `/api/auth` | JavaScript cannot read it, and a database leak cannot be replayed | Needs a table and a cleanup job |
| Rotation with reuse detection | Each refresh token works once; presenting a used one revokes every session of that account | A lost network response can force a new login |
| Spring Security's resource server for JWT validation | No hand-written token filter to get wrong | HS256 means the API both signs and verifies (fine for one service) |
| Admin account bootstrapped from env vars, BCrypt cost 12 | No credentials in code or migrations; an existing account is never modified | Changing the password means updating the database, not the env var |
| Login takes the same time for unknown users and wrong passwords | No username enumeration by timing | One extra BCrypt check on unknown users |
| Bucket4j token buckets per IP, held in memory (Caffeine) | Contact form and login are throttled with no extra infrastructure | Limits are per instance; a multi-node deployment would need a shared store |
| Honeypot answers `202` like a real submission | Bots learn nothing from the response | A person using a form filler that populates hidden fields is dropped silently |
| Upload type detected from the file's leading bytes | The file name and `Content-Type` header are attacker-controlled; SVG is refused outright | Only the listed formats are accepted |
| Storage keys are generated UUIDs and validated on read | Rules out path traversal and overwriting | Original file names are not kept |
| Fail-fast configuration | Missing `APP_JWT_SECRET` or a short admin password stops startup with a clear message | The app will not start half-configured |

Uploads live on local disk behind the `StorageService` interface. On hosts with an ephemeral
filesystem they need a mounted volume, or an S3/Cloudflare R2 implementation of the same interface.

## Palette and contrast

The six A&J brand colours are fixed. Extra shades are derived by changing lightness only, so no new
hues appear. `frontend/src/styles/tokens.test.ts` fails the build if a text/background pair drops
below WCAG AA (4.5:1).

Two findings from that check shape how the palette is used:

- `#5c574c` (warm secondary) is only 2.4:1 on the ink base, so it is used for hairlines and
  decoration. Its lighter steps (`warm-300`, `warm-400`) are the text-safe versions.
- White on orange is 3.0:1, so orange buttons use dark ink text (5.6:1), not white.
