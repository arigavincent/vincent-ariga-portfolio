# Vincent Ariga · A&J — Portfolio

Personal portfolio of **Vincent Ariga**, backend engineer (Java / Spring Boot, Kotlin, Go) who also
builds full-stack products.

A monorepo with a Spring Boot API and a React + Three.js frontend, built phase by phase.

## Stack

| Layer | Tech |
| --- | --- |
| Backend | Java 21, Spring Boot 3.5, Gradle (Kotlin DSL), PostgreSQL |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Motion, GSAP, Lenis, Three.js (React Three Fiber) |
| Tooling | Docker Compose, GitHub Actions, Spotless, ESLint, Prettier, Vitest, JUnit 5 |

## Repository layout

```
backend/    Spring Boot API (Gradle)
frontend/   React + Vite app
docs/       Architecture notes and guides
.github/    CI workflow
```

## Getting started

Requirements: JDK 21, Node 22+ (24 LTS recommended), Docker (optional, for the Postgres stack).

### Backend

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'   # in-memory database, no setup
./gradlew build            # format check + tests + jar
./gradlew spotlessApply    # fix formatting
```

The `local` profile uses an in-memory H2 database (PostgreSQL mode) that is migrated and seeded on
every start. Without it, the app expects PostgreSQL via `SPRING_DATASOURCE_URL`,
`SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` (see Docker below).

| URL | What |
| --- | --- |
| `http://localhost:8080/swagger-ui.html` | Interactive API docs |
| `http://localhost:8080/v3/api-docs` | OpenAPI document |
| `http://localhost:8080/actuator/health` | Health check |

**Public endpoints**

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/projects`, `/api/projects/{slug}` | Published only; `?featured=true` to filter |
| GET | `/api/skills`, `/api/experience`, `/api/education`, `/api/services` | In display order |
| GET | `/api/blog`, `/api/blog/{slug}` | Published only |
| GET | `/api/settings` | Profile and site-wide copy |
| GET | `/api/cv` | CV as a PDF download (placeholder until one is uploaded) |
| GET | `/api/files/{key}` | Uploaded images |
| POST | `/api/contact` | Validated, honeypot-protected, rate limited per IP |

**Auth and admin endpoints** (admin needs `Authorization: Bearer <access token>`)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/login` | Returns a 15-minute access token, sets the HttpOnly refresh cookie |
| POST | `/api/auth/refresh`, `/api/auth/logout` | Rotates or revokes the refresh cookie |
| GET | `/api/admin/me` | Current admin |
| CRUD | `/api/admin/{projects,skills,experience,education,services,blog}` | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` |
| GET, PUT | `/api/admin/settings` | Edit profile and site copy |
| GET, PATCH, DELETE | `/api/admin/messages` | Contact inbox, plus `/unread-count` |
| POST | `/api/admin/uploads`, `/api/admin/cv` | Image upload; replace the CV PDF |

To use the admin API locally, set the first admin account before starting:

```bash
export APP_ADMIN_USERNAME=you APP_ADMIN_PASSWORD='at-least-12-characters'
./gradlew bootRun --args='--spring.profiles.active=local'
```

Every setting is an environment variable; see [`.env.example`](.env.example). Outside the `local`
profile the app refuses to start without `APP_JWT_SECRET`.

### Seed data

On startup the app fills any empty content table with starter content (profile, skills, projects,
experience, education, services). It never overwrites existing rows. Anything that still needs
confirming carries a visible `[verify]` marker. Set `APP_SEED_ENABLED=false` to turn seeding off.

### Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 (proxies /api to :8080, so start the backend too)
npm run lint
npm test
npm run build
```

### Full stack with Docker

```bash
cp .env.example .env       # then set POSTGRES_PASSWORD, APP_JWT_SECRET and the admin account
docker compose up --build
```

In development, `http://localhost:5173/styleguide` shows every token and component of the design
system. It is not part of production builds.

## Design tokens

The A&J palette lives in one file, [`frontend/src/styles/tokens.css`](frontend/src/styles/tokens.css),
which is both the Tailwind theme and the CSS variables. Components never hardcode colours, and a
test enforces WCAG AA contrast for every text/background pair. See
[`docs/architecture.md`](docs/architecture.md) for the reasoning.

## Roadmap

1. ~~Foundation: monorepo, skeletons, CI, Docker Compose~~ (v0.1.0)
2. ~~Backend domain: entities, migrations, public API, seed data~~ (v0.2.0)
3. ~~Security and admin API: JWT, CRUD, uploads, contact form~~ (v0.3.0)
4. ~~Frontend design system and layout~~ (v0.4.0)
5. ~~3D hero and scroll storytelling~~ (v0.5.0)
6. Content sections
7. Admin dashboard
8. Polish and quality
9. Deployment and docs

## License

[MIT](LICENSE)
