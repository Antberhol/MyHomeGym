# Contributing to MyHomeGym

**English** · [Español](CONTRIBUTING.es.md)

Thanks for wanting to improve the project. These rules exist so that any change is easy to review.

## Before opening a pull request

1. Open an issue first if the change is big or changes behavior, so we can discuss it before you write code.
2. One pull request = one change. Several small ones are better than a huge one.
3. Check that everything passes locally:

```bash
cd backend && ./mvnw verify
cd frontend && npm run lint && npm test && npm run check:i18n && npm run build
```

CI runs exactly the same checks, and nothing red gets merged.

## Code rules

### Frontend (JavaScript)

- Screens never call `fetch`: they use hooks and repositories, which use `src/lib/db.js`, which uses `src/lib/api.js`.
- Every visible text goes in `src/locales/es.json` and `src/locales/en.json`, with the same keys.
- Colors and fonts only through the tokens in `tailwind.config.js` (`gym-*`, `plate-*`, `font-display`). No hard-coded colors.
- Violet (`gym-accent`) is only for actions; `gym-danger`, for errors and deleting; the plate colors (`plate-*`), only for data. The palette lives in `src/styles/theme.css`.
- A file longer than about 300 lines gets split.

### Backend (Java)

- A new user resource extends `OwnedEntity` and `OwnedCrudController`, so it inherits the rule that nobody touches someone else's data.
- Never trust an `ownerId` sent by the client: it always comes from the JWT.
- Every new endpoint has its test in `src/test` (MockMvc).
- Errors use `ResponseStatusException` or `NotFoundException`; use `ApiException` when the app needs to translate the message. The client receives `{"error": "message", "code": "CODE"}`.

## Improving translations

- **Exercise names (Spanish)**: find the exercise `id` in `backend/src/main/resources/catalog/exercises/` (one file per primary muscle, one exercise per line) and change its `nameEs`. It's the easiest and most useful contribution. A test checks that each exercise stays on a single line and in its muscle's file.
- **Muscles, equipment and levels**: `backend/src/main/java/com/myhomegym/catalog/CatalogVocabulary.java`.
- **Interface texts**: `frontend/src/locales/*.json`.

## Documentation and requirements

- A new feature or rule is added to its module of the requirements specification, `docs/es/requisitos/`, with its `FR` (functional requirement), its `RN` (business rule) if it involves a calculation or condition, and at least one `AC` (acceptance test).
- If the test is automated, cite it and add it to the matrix in `docs/es/requisitos/13-trazabilidad.md`.
- If what the user sees changes, also update `docs/en/USER_GUIDE.md` and its Spanish version, `docs/es/FUNCIONALIDAD.md`.
- README, CONTRIBUTING, SECURITY, AGENTS, the user guide and the architecture exist in English and Spanish: change both. The requirements (`docs/es/requisitos/`) and the diagrams are only in Spanish; if you don't speak Spanish, say so in the pull request and the maintainer will update them.

## If you use an AI assistant

You can use Claude Code, Codex, Copilot or whichever you prefer, as long as you follow [AGENTS.md](AGENTS.md): the agent follows its rules, you review and understand every line, and the pull request says that you used AI and for which parts.

## License of contributions

MyHomeGym is distributed under GPL-3.0-or-later. By sending a pull request you agree that your contribution is published under that same license, and you declare that the code is yours or that you have the right to contribute it. New dependencies must have a compatible license (MIT, BSD, Apache-2.0, MPL-2.0, OFL or similar); if you add one, list it in `NOTICE`.

## Commits

Short messages in the imperative that say what changes and why, for example `Fix 1RM calculation with 0 reps`.
