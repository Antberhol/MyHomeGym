# Guía para programar MyHomeGym con IA

[English](AGENTS.md) · **Español**

> Esta es la traducción al español. La versión que leen los agentes es [AGENTS.md](AGENTS.md), en inglés; las dos dicen lo mismo.

Esta guía es obligatoria para cualquier asistente de IA que escriba o cambie código de MyHomeGym, y para la persona que lo usa. Si tu herramienta no lee `AGENTS.md` por su cuenta, dásela al empezar (ver el último apartado).

Proyecto: backend Spring Boot 3.5 con Java 21 en `backend/`, frontend React + Vite en JavaScript en `frontend/`. Todo funciona en local: base de datos H2 en fichero y sin servicios propios en la nube.

## 1. Lo que tiene que hacer la persona

La IA es una herramienta; la responsable del cambio es la persona que abre el pull request.

1. **Revisa y entiende cada línea** antes de proponerla. Si no sabes explicar un cambio, no lo envíes.
2. **Dilo en el pull request**: indica que has usado IA y en qué partes. No es un problema; ocultarlo, sí.
3. **No le des a la IA datos que no deba ver**: ni contraseñas, ni tokens, ni la carpeta `backend/data/`, ni copias de seguridad con datos reales.
4. **Licencia**: todo lo que se añade se publica bajo GPL-3.0-or-later. No pegues ni pidas código copiado de proyectos con licencia incompatible o desconocida. Una dependencia nueva necesita licencia compatible y su línea en `NOTICE`.
5. Un pull request generado con IA que no compila, no pasa los tests o no sigue esta guía se cierra sin revisarlo.

## 2. Reglas obligatorias para el agente

### Antes de tocar nada

- Lee `README.md`, `docs/es/ARCHITECTURE.md` y el módulo de requisitos afectado en `docs/es/requisitos/`.
- Si la petición contradice esta guía o la especificación (ERS), dilo y pregunta antes de programar.

### Verificación

Nada está terminado hasta que pasan, sin errores ni avisos nuevos:

```bash
cd backend && ./mvnw verify
cd frontend && npm run lint && npm test && npm run check:i18n && npm run build
```

Nunca desactives, borres ni debilites un test, una regla de lint o una comprobación para que algo pase.

### Código

1. **Frontend en JavaScript**, sin TypeScript. Las pantallas acceden a los datos solo a través de repositorios → `src/lib/db.js` → `src/lib/api.js`. Ninguna pantalla llama a `fetch`.
2. **Textos**: todo texto visible va en `frontend/src/locales/es.json` y `en.json`, con las mismas claves. La app trata al usuario de tú.
3. **Estilos** solo con los tokens de `frontend/tailwind.config.js`. El violeta `gym-accent` es solo para acciones; `gym-danger`, para errores y borrar; los colores `plate-*`, solo para datos. La paleta vive en `frontend/src/styles/theme.css`. Objetivos táctiles de 44 px como mínimo.
4. **Backend**: los recursos de usuario extienden `OwnedEntity` y `OwnedCrudController`. El propietario sale siempre del JWT, nunca del cuerpo de la petición. Los errores que la app deba traducir usan `ApiException` con un código estable.
5. **Tests**: cada endpoint o regla nueva lleva su test (MockMvc en el backend, Vitest en el frontend). Un fallo corregido lleva un test que lo habría detectado.
6. **Tamaño**: un fichero de más de unas 300 líneas se divide.
7. **Catálogo**: nada de datos de catálogo en ficheros `.js`. Vive en `backend/src/main/resources/catalog/exercises/`, un fichero por músculo principal y un ejercicio por línea.
8. **Secretos y datos**: nada de secretos en el repositorio. La carpeta `backend/data/` nunca se sube. Los tests usan datos inventados.

### Seguridad y privacidad

- No debilites la autenticación: BCrypt, JWT en memoria, cookie de refresco `HttpOnly`, bloqueo por intentos ni la comprobación de propietario.
- No añadas telemetría, analítica, anuncios ni conexiones a servicios externos nuevos. Los datos del usuario no salen de su equipo.
- Todo lo que llega al servidor se valida (Bean Validation) y lo que se guarda en varios pasos va en una transacción.

### Documentación

Un cambio de comportamiento no está terminado sin su documentación:

- Requisito o regla nueva: su `FR`, su `RN` si tiene cálculo o condición, y al menos una prueba de aceptación `AC` en el módulo de `docs/es/requisitos/`. Si está automatizada, cita el test y añádelo a `docs/es/requisitos/13-trazabilidad.md`. Los identificadores nunca se reutilizan.
- Si cambia lo que ve el usuario: `docs/es/FUNCIONALIDAD.md` y `docs/en/USER_GUIDE.md`.
- Si cambia la API o la estructura: `docs/es/ARCHITECTURE.md` y `docs/en/ARCHITECTURE.md`.
- README, CONTRIBUTING, SECURITY, AGENTS, la guía de uso y la arquitectura están en inglés y en español (`*.es.md`, `docs/en/` y `docs/es/`): cambia siempre los dos idiomas. Los requisitos y los diagramas solo están en español.
- Siempre: una línea en `CHANGELOG.md`, en *Sin publicar*.

### Lo que el agente no hace por su cuenta

Solo con una petición explícita de la persona:

- Cambiar `LICENSE`, `NOTICE` (salvo añadir el crédito de una dependencia nueva) o los flujos de `.github/workflows/`.
- Cambiar el número de versión, crear etiquetas o publicar releases.
- Hacer `git push`, reescribir el historial o borrar ramas.
- Añadir dependencias. Si hacen falta, proponlas con su licencia y el motivo.

## 3. Antes de entregar

- [ ] Las órdenes de verificación pasan.
- [ ] Hay tests para lo nuevo y para el fallo corregido.
- [ ] Los textos nuevos están en español y en inglés.
- [ ] La documentación y `CHANGELOG.md` están al día, en los dos idiomas donde existan.
- [ ] No hay secretos, datos reales ni ficheros de `backend/data/`.
- [ ] El resumen del cambio dice qué se ha hecho, cómo se ha comprobado y qué queda pendiente.

## 4. Configurar tu herramienta

Las reglas comunes viven solo en este fichero. Los ficheros de configuración propios de cada herramienta son personales y están en `.gitignore`.

| Herramienta | Cómo le das esta guía |
| --- | --- |
| Codex, GitHub Copilot, Cursor, Zed y otras compatibles | Leen `AGENTS.md` solas. |
| Claude Code | Crea un `CLAUDE.md` local con la línea `@AGENTS.md`. |
| Gemini CLI | Crea un `GEMINI.md` local con la línea `@AGENTS.md`, o configura `AGENTS.md` como fichero de contexto. |
| Cualquier otra | Pega el contenido de este fichero al principio de la conversación. |
