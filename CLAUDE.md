# Reglas para asistentes de código (Claude Code, Codex...)

> Este es el único fichero de reglas del proyecto. Claude Code lo lee como `CLAUDE.md`.

Proyecto: MyHomeGym. Backend Spring Boot 3.5 + Java 21 en `backend/`, frontend React + Vite en JavaScript en `frontend/`. Lee `docs/ARCHITECTURE.md` antes de cambios grandes.

1. Nada está terminado hasta que pasan `cd backend && ./mvnw verify` y `cd frontend && npm run lint && npm test && npm run check:i18n && npm run build`.
2. Frontend en JavaScript (sin TypeScript). Las pantallas acceden a datos solo a través de repositorios → `src/lib/db.js` → `src/lib/api.js`.
3. Todo texto visible va en `frontend/src/locales/es.json` y `en.json`, con las mismas claves.
4. Estilos solo con los tokens de `frontend/tailwind.config.js`. El violeta `gym-accent` es solo para acciones; `gym-danger`, para errores y borrar; los colores `plate-*`, solo para datos. La paleta vive en `frontend/src/styles/theme.css`.
5. Backend: los recursos de usuario extienden `OwnedEntity` y `OwnedCrudController`. El propietario sale siempre del JWT, nunca del cuerpo de la petición.
6. Cada endpoint o regla nueva lleva un test.
7. Ficheros de más de unas 300 líneas se dividen. Nada de datos de catálogo en ficheros `.js`: el catálogo vive en `backend/src/main/resources/catalog/exercises/`, un fichero por músculo principal y un ejercicio por línea.
8. Sin secretos en el repositorio. La carpeta `backend/data/` nunca se sube.
