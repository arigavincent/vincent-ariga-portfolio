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
