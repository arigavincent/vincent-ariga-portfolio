# Vincent Ariga · A&J — Portfolio

Personal portfolio of **Vincent Ariga**, backend engineer (Java / Spring Boot, Kotlin, Go) who also
builds full-stack products.

A monorepo with a Spring Boot API and a React + Three.js frontend, built phase by phase.

## Stack

| Layer | Tech |
| --- | --- |
| Backend | Java 21, Spring Boot 3.5, Gradle (Kotlin DSL), PostgreSQL |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
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
./gradlew bootRun          # http://localhost:8080/actuator/health
./gradlew build            # format check + tests + jar
./gradlew spotlessApply    # fix formatting
```

### Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 (proxies /api to :8080)
npm run lint
npm test
npm run build
```

### Full stack with Docker

```bash
cp .env.example .env       # then set POSTGRES_PASSWORD
docker compose up --build
```

## Design tokens

The A&J palette lives in one file, [`frontend/src/styles/tokens.css`](frontend/src/styles/tokens.css),
which is both the Tailwind theme and the CSS variables. Components never hardcode colours, and a
test enforces WCAG AA contrast for every text/background pair. See
[`docs/architecture.md`](docs/architecture.md) for the reasoning.

## Roadmap

1. **Foundation**: monorepo, skeletons, CI, Docker Compose (this release)
2. Backend domain: entities, migrations, public API, seed data
3. Security and admin API: JWT, CRUD, uploads, contact form
4. Frontend design system and layout
5. 3D hero and scroll storytelling
6. Content sections
7. Admin dashboard
8. Polish and quality
9. Deployment and docs

## License

[MIT](LICENSE)
