# Historial de versiones

Todos los cambios relevantes de MyHomeGym. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones, [Versionado Semántico](https://semver.org/lang/es/). Cómo se publica una versión: [docs/es/RELEASE.md](docs/es/RELEASE.md).

## [Sin publicar]
- Translate requirements module 00-introduccion.md to English (docs/en/requirements/00-introduccion.md).

### Cambiado

- Las reglas para asistentes de IA pasan de `CLAUDE.md` a `AGENTS.md`, válido para cualquier herramienta, con lo que debe hacer la persona y lo que debe hacer el agente.
- La documentación se divide en `docs/es/` (español) y `docs/en/` (inglés), con un índice en `docs/README.md`. El README principal pasa a estar en inglés; el español está en `README.es.md`.
- Notas de la versión 1.0.0-beta.1 en inglés y en español.

### Añadido
- Tests unitarios para `units.js` y `text.js` (`frontend/tests/unit/units-and-text.test.js`): conversiones, round trips y normalización de nombres.

- `SECURITY.md`: qué datos guarda la app, qué conexiones hace y cómo avisar de un fallo de seguridad en privado.
- Documentación en inglés y en español: README, CONTRIBUTING, SECURITY, AGENTS, guía de uso (`docs/en/USER_GUIDE.md`) y arquitectura. Los requisitos y los diagramas siguen solo en español.
- Insignias en el README (CI, versión, licencia y tecnologías).
- Plantillas de GitHub para issues (fallo, mejora y traducción) y para pull requests, con la lista de comprobación de `AGENTS.md`.

### Corregido

- Con la app en inglés, el mapa muscular solo marcaba bíceps y tríceps; ahora reconoce todos los músculos en los dos idiomas.

## [1.0.0-beta.1] - 2026-11-17

Primera versión pública, en fase beta.

### Añadido

- Entrenos guiados por rutina y entrenos libres, con series, RPE, tipos de serie, temporizador de descanso con aviso, cronómetro y calculadora de discos. El entreno en curso sobrevive a recargas.
- Rutinas, carpetas, plantillas (Full Body, Push Pull Legs, Upper Lower, 5×5) y doble progresión con sugerencia de peso.
- Catálogo de 876 ejercicios de free-exercise-db con nombres en español, fotos, instrucciones traducidas automáticamente, ejercicios propios y una nota por ejercicio.
- Progreso: récords personales, 1RM estimado, volumen semanal, rachas, medidas corporales y mapa muscular sobre una figura anatómica.
- Cuentas de usuario con JWT y token de refresco rotatorio; cada usuario solo ve sus datos.
- Copia de seguridad en JSON (restaurar o fusionar), entrenos en CSV y resumen en PDF. Todo en español e inglés.
- PWA instalable, con la interfaz y las tipografías incluidas (sin Google Fonts).
- Especificación de requisitos (ERS 2.2) con trazabilidad a los tests, guía para Android y todos los diagramas en imagen (`docs/es/DIAGRAMAS.md`).

### Corregido antes de publicar

- Corregir una sesión pasada recalcula los récords de esa sesión y de las siguientes, y lo guarda todo de una vez (RN-4.15).
- "Borrar caché y recargar", en la pantalla de error, ya no borra el entreno en curso; si el error vuelve, se puede descartar aparte (RN-6.14).
- Las instrucciones traducidas tratan siempre de tú (RN-5.13).
- El asistente inicial ya no se salta el paso que enseña el IMC.
- Sin avisos de seguridad en las dependencias (`npm audit`: 0).

### Limitaciones conocidas

- Es una beta: haz una copia de seguridad en JSON (Configuración → Tus datos) antes de actualizar a otra versión.
- Pensada para uso en local o en una red de confianza; para exponerla a internet, sírvela por HTTPS y activa `APP_COOKIES_SECURE=true`.
- La base de datos H2 admite un solo proceso: no arranques dos servidores con la misma carpeta de datos.

[Sin publicar]: https://github.com/Antberhol/MyHomeGym/compare/v1.0.0-beta.1...HEAD
[1.0.0-beta.1]: https://github.com/Antberhol/MyHomeGym/releases/tag/v1.0.0-beta.1
