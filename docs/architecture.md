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
├── config       JPA auditing, OpenAPI
├── controller   REST endpoints (thin: delegate to services)
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
| `OrderedEntity` / `OrderedRepository` / `OrderedContentService` base types | Skills, experience, education and services share one implementation of "list in display order" | A small amount of generics |
| One `ApiError` shape from a single `@RestControllerAdvice` | Clients handle one error format, including Spring MVC's own errors | Spring's `ProblemDetail` format is not used |
| Seed runner fills empty tables only | Safe to leave enabled: admin edits are never overwritten | Changing seed copy later does not update an existing database |

## Palette and contrast

The six A&J brand colours are fixed. Extra shades are derived by changing lightness only, so no new
hues appear. `frontend/src/styles/tokens.test.ts` fails the build if a text/background pair drops
below WCAG AA (4.5:1).

Two findings from that check shape how the palette is used:

- `#5c574c` (warm secondary) is only 2.4:1 on the ink base, so it is used for hairlines and
  decoration. Its lighter steps (`warm-300`, `warm-400`) are the text-safe versions.
- White on orange is 3.0:1, so orange buttons use dark ink text (5.6:1), not white.
