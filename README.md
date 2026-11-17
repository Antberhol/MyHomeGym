# MyHomeGym

Aplicación de software libre (GPL-3.0) para registrar entrenamientos de fuerza en tu gimnasio en casa. Funciona entera en tu equipo: un backend Spring Boot con su propia base de datos y una interfaz web React pensada para el móvil.

- Entrenamientos guiados por rutina o libres, con series, RPE, temporizador de descanso y calculadora de discos.
- Rutinas, carpetas y plantillas (Full Body, Push Pull Legs, Upper Lower, 5×5).
- Catálogo de 876 ejercicios de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) con nombres traducidos a mano y fotos de cada ejercicio.
- Récords personales, 1RM estimado, volumen semanal, medidas corporales y mapa muscular.
- Cuentas de usuario con JWT. Copia de seguridad en JSON, entrenos en CSV y resumen en PDF.
- En español e inglés. Instalable como app (PWA). No carga nada de terceros salvo las fotos del catálogo.

## Versión actual

**1.0.0-beta.1** (beta). La forma más rápida de probarla es descargar el `.jar` de la página de *Releases* y ejecutarlo con `java -jar` (solo necesitas Java 21). Antes de actualizar de una beta a otra, exporta una copia de seguridad en JSON. Los cambios de cada versión están en [CHANGELOG.md](CHANGELOG.md).

## Requisitos (para compilarla)

- Java 21 (JDK)
- Node.js 22 y npm

No hace falta instalar Maven: el proyecto incluye `mvnw`.

## Puesta en marcha

### Opción A: todo en un único servidor (uso diario)

```bash
cd frontend
npm ci
npm run build:backend      # compila la interfaz y la copia dentro del backend

cd ../backend
./mvnw spring-boot:run     # en Windows: mvnw.cmd spring-boot:run
```

Abre <http://localhost:8080>, crea tu cuenta y listo. Los datos se guardan en `backend/data/`.

### Opción B: desarrollo con recarga en caliente

```bash
# Terminal 1
cd backend && ./mvnw spring-boot:run

# Terminal 2
cd frontend && npm ci && npm run dev
```

Abre <http://localhost:5173>. Vite reenvía `/api` al backend, así que no hay que tocar CORS.

## Configuración

Todo se configura en `backend/src/main/resources/application.yml` o con variables de entorno:

| Variable | Valor por defecto | Para qué |
| --- | --- | --- |
| `MYHOMEGYM_DATA_DIR` | `./data` | Carpeta de la base de datos H2 y de la clave JWT |
| `MYHOMEGYM_JWT_SECRET` | vacío | Clave HMAC en Base64 (32 bytes o más). Si está vacía se genera una al arrancar y se guarda en la carpeta de datos |
| `APP_TRANSLATION_PROVIDER` | `mymemory` | `mymemory`, `libretranslate` o `none` |
| `APP_TRANSLATION_EMAIL` | vacío | Correo de contacto para MyMemory: amplía su cuota diaria gratuita |
| `APP_TRANSLATION_URL` | `http://localhost:5000` | URL de tu instancia de LibreTranslate |
| `APP_COOKIES_SECURE` | `false` | Ponlo a `true` si sirves la app por HTTPS |
| `SERVER_PORT` | `8080` | Puerto del servidor |

### Traducción de ejercicios

- **Nombres**: traducidos a mano, en el campo `nameEs` de cada ejercicio. El catálogo está en `backend/src/main/resources/catalog/exercises/`: un fichero por músculo principal (`chest.json`, `quadriceps.json`...) y un ejercicio por línea. Si ves un nombre mejorable, abre un pull request.
- **Instrucciones**: se traducen automáticamente la primera vez que alguien abre la ficha y se guardan en la base de datos. Si el traductor no responde, la ficha muestra los pasos en inglés y lo indica.
- Para no depender de un servicio externo, ejecuta [LibreTranslate](https://github.com/LibreTranslate/LibreTranslate) en local y usa `APP_TRANSLATION_PROVIDER=libretranslate`.

## Comandos útiles

| Dónde | Comando | Qué hace |
| --- | --- | --- |
| `backend/` | `./mvnw verify` | Compila y pasa los tests |
| `backend/` | `./mvnw package` | Genera `target/myhomegym-backend-<versión>.jar` (ejecutable con `java -jar`) |
| `frontend/` | `npm run dev` | Servidor de desarrollo |
| `frontend/` | `npm run lint` | ESLint |
| `frontend/` | `npm test` | Tests con Vitest |
| `frontend/` | `npm run check:i18n` | Comprueba que español e inglés tienen las mismas claves |
| `frontend/` | `npm run build` | Build de producción en `frontend/dist` |

## Estructura

```
backend/    API REST Spring Boot (Java 21): auth JWT, dominio, catálogo, traducción
frontend/   Interfaz React + Vite en JavaScript (PWA)
docs/       Funcionalidad, arquitectura y catálogo de requisitos
```

## Documentación

- [docs/FUNCIONALIDAD.md](docs/FUNCIONALIDAD.md): qué hace la app, pantalla por pantalla, y con qué reglas.
- [docs/REQUISITOS_FUNCIONALES_Y_ACEPTACION.md](docs/REQUISITOS_FUNCIONALES_Y_ACEPTACION.md): especificación de requisitos (ERS): objetivos, casos de uso, requisitos de información, funcionales y no funcionales, reglas de negocio, pruebas de aceptación y trazabilidad a los tests. La misma ERS en un solo documento de Word: [docs/MyHomeGym-ERS.docx](docs/MyHomeGym-ERS.docx).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): cómo está construida.
- [docs/DIAGRAMAS.md](docs/DIAGRAMAS.md): todos los diagramas (casos de uso, datos, arquitectura) en imagen.
- [docs/ANDROID.md](docs/ANDROID.md): guía para llevarla a Android.
- [docs/RELEASE.md](docs/RELEASE.md): cómo publicar una versión.
- [CHANGELOG.md](CHANGELOG.md): historial de versiones.

## Seguridad

- Contraseñas con BCrypt; bloqueo de 15 minutos tras 5 intentos fallidos.
- JWT de acceso de 15 minutos guardado solo en memoria; token de refresco rotatorio en cookie `HttpOnly` y `SameSite=Strict`.
- Cada usuario solo puede leer y modificar sus propios datos (comprobado en los tests de integración).
- No hay secretos en el repositorio. La base de datos y la clave JWT están en `.gitignore`.

Si encuentras un problema de seguridad, abre una issue sin detalles explotables y lo coordinamos.

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md). Todo pull request pasa por la CI (`.github/workflows/ci.yml`), que compila y prueba backend y frontend.

## Licencia

MyHomeGym es software libre bajo la **GNU General Public License v3.0 o posterior** (`GPL-3.0-or-later`). Copyright © 2026 Antonio M. Bernaza Holgado.

En la práctica:

- Puedes usarla, estudiarla, modificarla y compartirla, también con cambios.
- Si distribuyes la app o una versión modificada, tienes que mantener los avisos de autoría y publicar tu código bajo la misma licencia. No se puede convertir en un producto cerrado.
- Se ofrece sin garantía.
- El nombre "MyHomeGym" y su icono identifican al proyecto original: una versión modificada debe usar otro nombre y otro icono.

El texto completo está en [LICENSE](LICENSE). Los créditos de terceros, en [NOTICE](NOTICE):

- Datos de ejercicios e imágenes: [free-exercise-db](https://github.com/yuhonas/free-exercise-db), dominio público (The Unlicense).
- Figura anatómica: js-rich-body-highlighter, licencia MIT.
- Tipografías Barlow y Big Shoulders Display: SIL Open Font License 1.1.
- Traducciones automáticas: [MyMemory](https://mymemory.translated.net/) o tu instancia de LibreTranslate.
