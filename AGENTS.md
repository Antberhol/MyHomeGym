# Guide for coding MyHomeGym with AI

**English** · [Español](AGENTS.es.md)

This guide is mandatory for any AI assistant (Claude Code, Codex, Copilot, Cursor, Gemini…) that writes or changes MyHomeGym code, and for the person using it. If your tool doesn't read `AGENTS.md` on its own, give it this file when you start (see the last section).

Project: Spring Boot 3.5 backend with Java 21 in `backend/`, React + Vite frontend in JavaScript in `frontend/`. Everything runs locally: an H2 database in a file and no cloud services of its own. Code identifiers and the requirements specification are in Spanish.

## 1. What the person must do

AI is a tool; the person who opens the pull request is responsible for the change.

1. **Review and understand every line** before proposing it. If you can't explain a change, don't send it.
2. **Say so in the pull request**: state that you used AI and for which parts. Using it is fine; hiding it is not.
3. **Don't give the AI data it shouldn't see**: no passwords, tokens, the `backend/data/` folder or backups with real data.
4. **License**: everything added is published under GPL-3.0-or-later. Don't paste or ask for code copied from projects with an incompatible or unknown license. A new dependency needs a compatible license and its line in `NOTICE`.
5. An AI-generated pull request that doesn't build, doesn't pass the tests or doesn't follow this guide is closed without review.

## 2. Mandatory rules for the agent

### Before touching anything

- Read `README.md`, `docs/en/ARCHITECTURE.md` and the affected requirements module in `docs/es/requisitos/`.
- If the request contradicts this guide or the specification, say so and ask before coding.

### Verification

Nothing is done until these pass, with no errors or new warnings:

```bash
cd backend && ./mvnw verify
cd frontend && npm run lint && npm test && npm run check:i18n && npm run build
```

Never disable, delete or weaken a test, a lint rule or a check to make something pass.

### Code

1. **Frontend in JavaScript**, no TypeScript. Screens access data only through repositories → `src/lib/db.js` → `src/lib/api.js`. No screen calls `fetch`.
2. **Texts**: every visible text goes in `frontend/src/locales/es.json` and `en.json`, with the same keys. In Spanish, the app addresses the user as "tú".
3. **Styles** only with the tokens in `frontend/tailwind.config.js`. Violet `gym-accent` is only for actions; `gym-danger`, for errors and deleting; `plate-*` colors, only for data. The palette lives in `frontend/src/styles/theme.css`. Touch targets of at least 44 px.
4. **Backend**: user resources extend `OwnedEntity` and `OwnedCrudController`. The owner always comes from the JWT, never from the request body. Errors the app needs to translate use `ApiException` with a stable code.
5. **Tests**: every new endpoint or rule has its test (MockMvc in the backend, Vitest in the frontend). A fixed bug comes with a test that would have caught it.
6. **Size**: a file longer than about 300 lines gets split.
7. **Catalog**: no catalog data in `.js` files. It lives in `backend/src/main/resources/catalog/exercises/`, one file per primary muscle and one exercise per line.
8. **Secrets and data**: no secrets in the repository. The `backend/data/` folder is never committed. Tests use made-up data.

### Security and privacy

- Don't weaken authentication: BCrypt, in-memory JWT, `HttpOnly` refresh cookie, lockout after failed attempts, or the owner check.
- Don't add telemetry, analytics, ads or connections to new external services. User data never leaves their machine.
- Everything that reaches the server is validated (Bean Validation), and anything saved in several steps goes in one transaction.

### Documentation

A behavior change isn't done without its documentation:

- New requirement or rule: its `FR`, its `RN` if it involves a calculation or condition, and at least one acceptance test `AC` in its module of `docs/es/requisitos/`. If the test is automated, cite it and add it to `docs/es/requisitos/13-trazabilidad.md`. Identifiers are never reused.
- If what the user sees changes: `docs/en/USER_GUIDE.md` and `docs/es/FUNCIONALIDAD.md`.
- If the API or the structure changes: `docs/en/ARCHITECTURE.md` and `docs/es/ARCHITECTURE.md`.
- README, CONTRIBUTING, SECURITY, AGENTS, the user guide and the architecture exist in English and Spanish (`*.es.md`, `docs/en/` and `docs/es/`): always change both languages. The requirements and the diagrams are only in Spanish.
- Always: one line in `CHANGELOG.md`, under *Sin publicar* (unreleased).

### What the agent doesn't do on its own

Only when the person explicitly asks:

- Change `LICENSE`, `NOTICE` (except adding the credit of a new dependency) or the workflows in `.github/workflows/`.
- Change the version number, create tags or publish releases.
- `git push`, rewrite history or delete branches.
- Add dependencies. If one is needed, propose it with its license and the reason.

## 3. Before handing over

- [ ] The verification commands pass.
- [ ] There are tests for what's new and for the fixed bug.
- [ ] New texts are in Spanish and English.
- [ ] The documentation and `CHANGELOG.md` are up to date, in both languages where they exist.
- [ ] No secrets, real data or files from `backend/data/`.
- [ ] The summary of the change says what was done, how it was checked and what is pending.

## 4. Setting up your tool

The shared rules live only in this file. Each tool's own configuration files are personal and are in `.gitignore`.

| Tool | How to give it this guide |
| --- | --- |
| Codex, GitHub Copilot, Cursor, Zed and other compatible tools | They read `AGENTS.md` on their own. |
| Claude Code | Create a local `CLAUDE.md` with the line `@AGENTS.md`. |
| Gemini CLI | Create a local `GEMINI.md` with the line `@AGENTS.md`, or set `AGENTS.md` as its context file. |
| Any other | Paste this file at the start of the conversation. |
