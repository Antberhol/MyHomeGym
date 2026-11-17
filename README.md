# MyHomeGym

[![CI](https://github.com/Antberhol/MyHomeGym/actions/workflows/ci.yml/badge.svg)](https://github.com/Antberhol/MyHomeGym/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Antberhol/MyHomeGym?include_prereleases&label=release)](https://github.com/Antberhol/MyHomeGym/releases)
[![License: GPL-3.0-or-later](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)](LICENSE)
[![Java 21](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](https://adoptium.net/)
[![Spring Boot 3.5](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/explore/progressive-web-apps)

**English** · [Español](README.es.md)

A free, open-source (GPL-3.0) app to log strength workouts in your home gym. It runs entirely on your own computer: a Spring Boot backend with its own database and a mobile-first React web app.

- Guided workouts from your routines, or free sessions, with sets, RPE, rest timer and plate calculator.
- Routines, folders and templates (Full Body, Push Pull Legs, Upper Lower, 5×5).
- A catalog of 876 exercises from [free-exercise-db](https://github.com/yuhonas/free-exercise-db), with photos of every exercise.
- Personal records, estimated 1RM, weekly volume, body measurements and a muscle map.
- User accounts with JWT. JSON backup, CSV export of workouts and a PDF summary.
- Spanish and English interface. Installable as an app (PWA). No telemetry: the only outgoing connections are the catalog photos and the translation of exercise instructions (can be turned off). Details in [SECURITY.md](SECURITY.md).

## Current version

**1.0.0-beta.1** (beta). The app is complete and tested, but few people have used it yet. Export a JSON backup before updating from one beta to the next. Changes in each version are listed in [CHANGELOG.md](CHANGELOG.md) (in Spanish).

## Quick start (no build needed)

1. Install Java 21, for example [Temurin](https://adoptium.net/).
2. Download `myhomegym-1.0.0-beta.1.jar` from the *Releases* page.
3. In the folder where you saved it, run:

   ```bash
   java -jar myhomegym-1.0.0-beta.1.jar
   ```

4. Open <http://localhost:8080>, create your account and pick your language. Your data is saved in a `data/` folder inside the folder you ran the `.jar` from.

From your phone, on the same network, open `http://<your-computer-ip>:8080` and add a shortcut to the home screen. Installing it as a full app (with offline support) requires serving it over HTTPS.

## Building from source

Requirements:

- Java 21 (JDK)
- Node.js 22 and npm

You don't need to install Maven: the project includes the `mvnw` wrapper.

### Option A: everything in one server (daily use)

```bash
cd frontend
npm ci
npm run build:backend      # builds the web app and copies it into the backend

cd ../backend
./mvnw spring-boot:run     # on Windows: mvnw.cmd spring-boot:run
```

Open <http://localhost:8080> and create your account. Data is stored in `backend/data/`.

### Option B: development with hot reload

```bash
# Terminal 1
cd backend && ./mvnw spring-boot:run

# Terminal 2
cd frontend && npm ci && npm run dev
```

Open <http://localhost:5173>. Vite forwards `/api` to the backend, so there is no CORS setup.

## Configuration

Everything is set in `backend/src/main/resources/application.yml` or with environment variables:

| Variable | Default | What it does |
| --- | --- | --- |
| `MYHOMEGYM_DATA_DIR` | `./data` | Folder for the H2 database and the JWT key |
| `MYHOMEGYM_JWT_SECRET` | empty | Base64 HMAC key (32 bytes or more). If empty, one is generated at startup and saved in the data folder |
| `APP_TRANSLATION_PROVIDER` | `mymemory` | `mymemory`, `libretranslate` or `none` |
| `APP_TRANSLATION_EMAIL` | empty | Contact email for MyMemory: raises its free daily quota |
| `APP_TRANSLATION_URL` | `http://localhost:5000` | URL of your LibreTranslate instance |
| `APP_COOKIES_SECURE` | `false` | Set it to `true` if you serve the app over HTTPS |
| `SERVER_PORT` | `8080` | Server port |

### Exercise translations

- **Names** are translated into Spanish by hand, in the `nameEs` field of each exercise. In English the app uses the original names.
- **Instructions** are in English in the catalog. When someone opens an exercise in Spanish for the first time, they are machine-translated and cached in the database. If the translator is unavailable, the steps are shown in English with a notice.
- To avoid any external service, run [LibreTranslate](https://github.com/LibreTranslate/LibreTranslate) locally and set `APP_TRANSLATION_PROVIDER=libretranslate`, or turn translation off with `APP_TRANSLATION_PROVIDER=none`.

The catalog lives in `backend/src/main/resources/catalog/exercises/`: one file per primary muscle (`chest.json`, `quadriceps.json`...) and one exercise per line.

## Useful commands

| Where | Command | What it does |
| --- | --- | --- |
| `backend/` | `./mvnw verify` | Compiles and runs the tests |
| `backend/` | `./mvnw package` | Builds `target/myhomegym-backend-<version>.jar` (runs with `java -jar`) |
| `frontend/` | `npm run dev` | Development server |
| `frontend/` | `npm run lint` | ESLint |
| `frontend/` | `npm test` | Tests with Vitest |
| `frontend/` | `npm run check:i18n` | Checks that Spanish and English have the same keys |
| `frontend/` | `npm run build` | Production build in `frontend/dist` |

## Project structure

```
backend/    Spring Boot REST API (Java 21): JWT auth, domain, catalog, translation
frontend/   React + Vite web app in JavaScript (PWA)
docs/       Documentation: docs/en (English) and docs/es (Spanish, including the requirements)
```

## Documentation

English documentation is in `docs/en/` and Spanish documentation in `docs/es/`; [docs/README.md](docs/README.md) indexes both.

In English:

- [docs/en/USER_GUIDE.md](docs/en/USER_GUIDE.md): what the app does, screen by screen, and the rules behind it.
- [docs/en/ARCHITECTURE.md](docs/en/ARCHITECTURE.md): how it is built.
- [CONTRIBUTING.md](CONTRIBUTING.md), [AGENTS.md](AGENTS.md) (rules for AI coding agents) and [SECURITY.md](SECURITY.md).

Only in Spanish:

- [docs/es/REQUISITOS_FUNCIONALES_Y_ACEPTACION.md](docs/es/REQUISITOS_FUNCIONALES_Y_ACEPTACION.md): the software requirements specification (objectives, use cases, functional and non-functional requirements, business rules, acceptance tests and traceability to the tests). Also as a single Word document: [docs/es/MyHomeGym-ERS.docx](docs/es/MyHomeGym-ERS.docx).
- [docs/es/DIAGRAMAS.md](docs/es/DIAGRAMAS.md): all the diagrams (use cases, data model, architecture) as images.
- [docs/es/ANDROID.md](docs/es/ANDROID.md): plan for an Android version, and [docs/es/RELEASE.md](docs/es/RELEASE.md): how to publish a release.

## Security

- Passwords hashed with BCrypt; 15-minute lockout after 5 failed attempts.
- 15-minute access JWT kept only in memory; rotating refresh token in an `HttpOnly`, `SameSite=Strict` cookie.
- Each user can only read and change their own data (checked by the integration tests).
- No secrets in the repository. The database and the JWT key are in `.gitignore`.

What data the app stores, which connections it makes and how to report a security issue privately: [SECURITY.md](SECURITY.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). If you code with an AI assistant, [AGENTS.md](AGENTS.md) is mandatory for both you and the agent. Every pull request goes through CI (`.github/workflows/ci.yml`), which builds and tests the backend and the frontend.

## License

MyHomeGym is free software under the **GNU General Public License v3.0 or later** (`GPL-3.0-or-later`). Copyright © 2026 Antonio M. Bernaza Holgado.

In short:

- You can use, study, modify and share it, including modified versions.
- If you distribute the app or a modified version, you must keep the copyright notices and publish your code under the same license. It cannot become a closed product.
- It comes with no warranty.
- The name "MyHomeGym" and its icon identify the original project: a modified version must use a different name and icon.

The full text is in [LICENSE](LICENSE). Third-party credits are in [NOTICE](NOTICE):

- Exercise data and images: [free-exercise-db](https://github.com/yuhonas/free-exercise-db), public domain (The Unlicense).
- Anatomical figure: js-rich-body-highlighter, MIT license.
- Barlow and Big Shoulders Display fonts: SIL Open Font License 1.1.
- Machine translations: [MyMemory](https://mymemory.translated.net/) or your own LibreTranslate instance.
