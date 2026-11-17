# MyHomeGym en Android: guía paso a paso

Qué haría falta para tener MyHomeGym como app de Android: qué cambia, qué se quita, qué se añade, cómo afecta al diseño, cuánto cuesta mantenerla tú solo y qué supone hacerla open source.

> Requisitos y plazos de Google comprobados en noviembre de 2026. Cambian cada año: repásalos antes de publicar.

## Resumen

- **Herramienta:** [Capacitor](https://capacitorjs.com) (versión 8). Envuelve la web actual en una app nativa. Casi todo el código React se reutiliza tal cual.
- **La decisión grande no es técnica, es dónde viven los datos.** Hoy la app necesita el backend Spring Boot encendido en tu PC. Un móvil fuera de casa no llega a él. Hay dos caminos (paso 1).
- **Esfuerzo aproximado:** con servidor, de 1 a 2 semanas de tardes; sin servidor (todo en el móvil), de 3 a 5 semanas.
- **Publicar en Google Play:** 25 USD una sola vez, verificación de identidad y una prueba cerrada con 12 personas durante 14 días antes de poder publicar.

## Paso 1. Decidir dónde viven los datos

| | A. Con servidor | B. Todo en el móvil (*local-first*) |
| --- | --- | --- |
| Cómo funciona | La app llama por HTTPS a tu backend, alojado en un VPS o en tu PC expuesto con un túnel | Los datos se guardan en SQLite dentro del móvil. No hay backend. |
| Qué se reutiliza | Todo el backend y todo el frontend | Todo el frontend. El backend solo sirve para generar el catálogo una vez. |
| Varios dispositivos | Sí, y cuenta con usuario y contraseña | No. Se pasa de un móvil a otro con la copia JSON. |
| Funciona sin cobertura | No (salvo que añadas caché) | Sí, entero (salvo las fotos del catálogo) |
| Coste mensual | VPS de 4 a 6 €/mes, o 0 € con tu PC encendido y un túnel | 0 € |
| Mantenimiento | App + servidor: parches de seguridad, copias de la base de datos, certificados | Solo la app |
| Privacidad y RGPD | Guardas datos de salud de otras personas en tu servidor: eres responsable del tratamiento | Los datos no salen del móvil: la política de privacidad es mucho más sencilla |

**Decisión (13/11/2026): camino B, todo en local.** Es más sencillo de mantener por una sola persona: no hay servidor que operar, ni cuentas, ni datos de salud de otras personas en tu infraestructura. Queda recogido como requisito de evolución EVO-02 en la [ERS](requisitos/11-restricciones-y-supuestos.md). El resto de la guía sigue explicando el camino A como referencia.

La capa de datos ya está preparada para el cambio: las pantallas solo hablan con `repositories → src/lib/db.js → src/lib/api.js`. En el camino B se sustituye la implementación de `db.js` y no se toca ninguna pantalla.

## Paso 2. Preparar el entorno

1. **Node.js 22 o superior.** Ya lo usas.
2. **Android Studio Otter (2025.2.1) o superior.** Trae el JDK y el emulador.
3. **En el SDK Manager de Android Studio:** Android SDK Platform 36 y un emulador con Android 16. Prueba también en tu móvil real con la depuración USB activada.

## Paso 3. Añadir Capacitor al frontend

```bat
cd frontend
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
npx cap init MyHomeGym com.antberhol.myhomegym --web-dir dist
npx cap add android
npm run build
npx cap sync android
npx cap open android
```

- El **identificador** (`com.antberhol.myhomegym`) no se puede cambiar una vez publicada la app. Elígelo bien.
- La carpeta `frontend/android/` es un proyecto de Android Studio normal y se sube al repositorio.
- Tras cada cambio en React: `npm run build && npx cap sync android`.
- Capacitor 8 ya viene con `minSdk 24` y `targetSdk 36`. Ese es el mínimo que exige Google Play desde el 31 de agosto de 2026 para apps nuevas y actualizaciones.

## Paso 4. Qué hay que cambiar en el código

### 4.1 Conexión con el servidor (solo camino A)

| Qué | Hoy | En Android |
| --- | --- | --- |
| URL de la API | `/api` relativa (`VITE_API_URL` sin definir) | `VITE_API_URL=https://tu-servidor/api` en un `.env.android` |
| Token de refresco | Cookie `HttpOnly` con `SameSite=Strict` | **No funciona:** la app se sirve desde `https://localhost` y el servidor está en otro dominio, así que la cookie no viaja. Hay que devolver el token en el cuerpo de la respuesta y guardarlo cifrado en el móvil (por ejemplo con `@capacitor-community/secure-storage` o el Keystore de Android). |
| CORS | Orígenes de desarrollo | Añadir `https://localhost` a los orígenes permitidos en `application.yml`. |
| HTTP | Funciona en local | Android bloquea HTTP sin cifrar: el servidor tiene que ir por **HTTPS**. |

Cada cambio del backend lleva su test (regla 5 de [AGENTS.md](../../AGENTS.es.md)): login sin cookie, refresco con el token en el cuerpo y CORS para `https://localhost`.

### 4.2 Datos en el móvil (solo camino B)

1. Añadir `@capacitor-community/sqlite`.
2. Escribir un `db.js` nuevo con la **misma interfaz** que el actual (`getAllRoutines`, `saveExerciseNote`…), pero contra SQLite. Las tablas son las mismas que las entidades del backend.
   Ojo: hay reglas que hoy aplica el servidor y que ese `db.js` tendría que aplicar él mismo, cada una dentro de una transacción de SQLite: guardar un entreno con sus series, borrar una rutina con sus ejercicios, dejar sin carpeta las rutinas al borrar una carpeta (RN-2.06), quitar un ejercicio propio de las rutinas al borrarlo (RN-5.12), fusionar una copia sin borrar nada (RN-6.03) y validar los datos (RI-01 a RI-13). Los tests del backend (`DataIntegrityApiTest`, `ApiIntegrationTest`) sirven de guía para escribir los equivalentes.
3. **Catálogo:** generar en la compilación un único JSON con los 876 ejercicios y sus instrucciones ya traducidas, a partir de `backend/src/main/resources/catalog/exercises/`. Se empaqueta dentro de la app (pesa unos pocos MB).
4. **Quitar** el login, el registro, la renovación de sesión y "Cerrar sesión". Ya no hay cuentas.
5. Las reglas de los récords, las rachas y el volumen ya están en el frontend, así que no cambian.
6. Las copias JSON y CSV pasan a ser la única forma de mover datos a otro móvil.

### 4.3 Cosas del navegador que en Android funcionan distinto (los dos caminos)

| Funcionalidad | Hoy (web) | En Android | Plugin |
| --- | --- | --- | --- |
| Avisos de racha y de descanso | API `Notification` del navegador | No existe dentro de la app. Hay que programar notificaciones locales y pedir el permiso de notificaciones (Android 13 o superior). | `@capacitor/local-notifications` |
| Fin del descanso con la pantalla apagada | El descanso ya se calcula con la hora real, pero el aviso depende de un temporizador del navegador | Android pausa la app en segundo plano: el aviso tiene que programarse como notificación local a la hora exacta de fin. Basta cambiar `scheduleRestTimerNotification`. | `@capacitor/local-notifications` |
| Vibración | `navigator.vibrate` | Más fiable con el plugin nativo | `@capacitor/haptics` |
| Pantalla encendida durante el entreno | No existe | Imprescindible en un gimnasio | `@capacitor-community/keep-awake` |
| Descargar la copia JSON, el CSV o el PDF | Enlace `<a download>` | No descarga nada. Hay que guardar el fichero y abrir el menú de compartir. | `@capacitor/filesystem` + `@capacitor/share` |
| Restaurar una copia | `<input type="file">` | Funciona, pero conviene probarlo | — |
| Botón o gesto "atrás" | Historial del navegador | Debe cerrar primero la hoja abierta y, en la pantalla de inicio, salir de la app | `@capacitor/app` |
| Teclado | El navegador recoloca la página | Puede tapar los campos de kilos y repeticiones | `@capacitor/keyboard` |
| Barra de estado y bordes | — | Android 15 o superior dibuja la app a pantalla completa (*edge-to-edge*). La app ya usa `env(safe-area-inset-*)`, pero hay que comprobar cada pantalla. | `@capacitor/status-bar` |

Todo esto va mejor detrás de un módulo nuevo, `src/lib/platform.js`, que decida si usar el plugin nativo o la API web con `Capacitor.isNativePlatform()`. Así la versión web sigue funcionando igual.

### 4.4 Qué se quita o se desactiva en la app nativa

- **La PWA** (`vite-plugin-pwa`, service worker y aviso de "nueva versión"). Dentro de Capacitor sobra y puede servir versiones viejas. Se desactiva solo en la compilación de Android.
- **La barra lateral de escritorio.** No estorba, pero en un móvil no se usa.
- En el camino B, todo lo de cuentas y sesión (4.2).

Ya está hecho: las tipografías van dentro de la app desde la versión 2.1 (`@fontsource/barlow` y `@fontsource/big-shoulders-display`), así que funcionan sin conexión y no se pide nada a Google.

## Paso 5. Qué supone para el diseño

La app ya se diseñó primero para móvil, así que el cambio es pequeño. Hay que revisar:

1. **Tamaño táctil:** Android recomienda **48 dp** para cualquier cosa que se toque. Desde la versión 2.1 todos los controles del entreno miden al menos 44 px; hay que subirlos a 48.
2. **Atrás:** cada hoja (series, filtros, selector de ejercicios) tiene que cerrarse con el gesto de atrás. Es lo primero que nota un usuario de Android.
3. **Pantalla completa:** comprobar que nada queda debajo de la barra de estado ni de la barra de gestos, sobre todo la barra de navegación inferior y la cabecera fija del entreno.
4. **Sin conexión:** decidir qué se ve si falla la red. Las fotos del catálogo vienen de GitHub; sin conexión se ve el icono de respaldo, que ya existe.
5. **Hover:** en un móvil no hay ratón; ningún dato puede depender de pasar el ratón por encima.
6. **Icono y pantalla de arranque:** a partir del icono actual (disco violeta) con `@capacitor/assets`. Android necesita un icono adaptable (fondo y primer plano por separado).
7. **Lo que no hace falta cambiar:** la paleta, la tipografía, el modo oscuro y la navegación inferior ya encajan con Android.

## Paso 6. Firmar y generar la app

1. En Android Studio: **Build → Generate Signed App Bundle** (`.aab`).
2. Crea un **keystore** y guárdalo fuera del repositorio, con copia de seguridad. **Si lo pierdes, no podrás actualizar la app nunca más** (salvo usando Play App Signing, que es lo recomendable).
3. Añade a `.gitignore`: `*.jks`, `*.keystore` y `keystore.properties`.
4. Sube el número de versión (`versionCode`) en cada publicación.

## Paso 7. Publicar

### Opción 1: Google Play

1. **Cuenta de desarrollador:** 25 USD una sola vez, con verificación de identidad.
2. **Prueba cerrada obligatoria:** las cuentas personales creadas después del 13 de noviembre de 2023 tienen que pasar una prueba cerrada con **12 personas durante 14 días seguidos** antes de poder publicar. Empieza a buscar a esas personas pronto: compañeros de la ETSII, amigos o gente del gimnasio.
3. **Ficha de la tienda:** descripción, capturas de móvil, icono de 512 px y gráfico de 1024 × 500.
4. **Política de privacidad** en una URL pública. Es obligatoria aunque no recojas datos. Con el camino B es muy corta.
5. **Formulario de seguridad de los datos** y **clasificación de contenido.**
6. **Nivel de API:** Android 16 (API 36) o superior. Capacitor 8 ya lo cumple.
7. Ojo con la palabra "salud": una app de entrenamiento no es una app médica. No prometas resultados de salud en la ficha.

### Opción 2: Sin tienda (APK directo)

- Generas un `.apk` firmado y lo instalas en tu móvil o se lo pasas a quien quieras.
- **Desde 2026, Google exige que los desarrolladores de apps instaladas fuera de la tienda estén verificados.** Empezó el 30 de septiembre de 2026 en Brasil, Indonesia, Singapur y Tailandia, y llega al resto del mundo en 2027.
- Para estudiantes y aficionados hay una **cuenta de distribución limitada**: gratis, sin documento de identidad, para hasta 20 dispositivos. Encaja perfecto con tu caso si es solo para ti y unos pocos amigos.
- Con ADB (cable USB y Android Studio) puedes seguir instalándola en tu propio móvil para desarrollar.

## Paso 8. ¿Podrías mantenerla tú solo?

Sí, sobre todo con el camino B. Lo que te va a tocar cada año:

| Tarea | Frecuencia | Esfuerzo |
| --- | --- | --- |
| Subir el `targetSdk` al que exija Google (la fecha suele ser el 31 de agosto) | Anual | De 1 a 4 horas si no hay sorpresas |
| Actualizar Capacitor a la versión mayor nueva | Anual | De 2 a 6 horas, con su guía de migración |
| Actualizar dependencias de npm (`npm outdated`, `npm audit`) | Mensual | Menos de 1 hora |
| Revisar los avisos de políticas de Play Console | Cuando lleguen | Variable, suelen ser formularios |
| Responder fallos y reseñas | Continuo | Depende de cuántos usuarios tengas |
| **Solo camino A:** parches del servidor, copias de seguridad de la base de datos, renovar HTTPS, vigilar caídas | Semanal o mensual | De 2 a 4 horas al mes |

Lo que ya juega a tu favor:

- Hay tests y CI: los cambios de versión se detectan pronto.
- `AGENTS.md` deja las reglas claras para cualquier asistente de IA que te ayude.
- La capa de datos está aislada en `db.js`.

Lo que ya se arregló en la versión 2.1 pensando en esto:

- `useActiveWorkoutController.js` pasó de 777 a menos de 300 líneas, y las reglas del entreno son funciones puras con tests.
- El cronómetro y el descanso se calculan con la hora real, así que aguantan que Android pause la app.
- Las tipografías van dentro de la app y los mensajes de error están traducidos.

Lo que queda pendiente está en la sección 11.6 de la [ERS](requisitos/11-restricciones-y-supuestos.md).

## Paso 9. Proyecto open source

**El código ya tiene licencia: GPL-3.0-or-later** (ficheros `LICENSE` y `NOTICE`, desde la versión 2.1). Lo que falta para que sea un proyecto open source de verdad es **publicarlo**: mientras el código esté solo en tu ordenador, nadie puede usarlo ni contribuir.

Por qué GPL-3.0 y no otra:

- **MIT** dejaría que cualquiera cerrase el código y lo vendiera sin publicar nada.
- **GPL-3.0** es lo que buscabas: la gente puede trastear y mandar *pull requests*, pero nadie se apropia de tu trabajo.
  - Cualquiera puede descargar el código, modificarlo y proponerte cambios.
  - Quien distribuya la app o una versión modificada **tiene que mantener tu aviso de autoría** y **publicar su código bajo la misma licencia**. No puede coger tu app, cerrarla y venderla como suya.
  - Lo que la GPL **no impide** es que alguien la venda, siempre que cumpla esas dos condiciones. Prohibir cualquier uso comercial exige una licencia "no comercial" (como PolyForm Noncommercial), y entonces el proyecto ya **no** se considera open source.
- **AGPL-3.0** añade la obligación de publicar el código a quien la ofrezca como servicio en un servidor. Con el camino B (sin servidor) no aporta nada.

Lo que ya está hecho:

1. `LICENSE` con el texto de la GPL-3.0 y `NOTICE` con tu copyright, la nota sobre el nombre y el icono, y los créditos de terceros (free-exercise-db, js-rich-body-highlighter, Barlow y Big Shoulders Display).
2. La licencia declarada en `frontend/package.json`, `backend/pom.xml`, `README.md` y `CONTRIBUTING.md` (las contribuciones entran bajo la misma licencia).
3. Comprobado que todas las dependencias tienen licencias compatibles (MIT, ISC, BSD, Apache-2.0, OFL, LGPL, MPL-2.0).

Lo que te queda a ti:

1. **Revisa que no se cuele nada privado antes del primer `git push`:** `backend/data/` (tu base de datos y la clave JWT), el keystore de Android y cualquier `.env`. El `.gitignore` ya excluye `backend/data/`.
2. **Sube el código a GitHub** como repositorio público. GitHub detecta la licencia sola a partir del fichero `LICENSE`.
3. **Opcional, F-Droid:** la tienda de apps libres de Android. Pide que todo el código y las dependencias sean libres y que la app compile desde el código fuente. Capacitor y los plugins oficiales lo son.

Ten en cuenta:

- Ser open source **no te impide publicar en Google Play**, ni siquiera cobrar por la app.
- El nombre y el icono no los cubre la licencia del código. Ya está dicho en `NOTICE` y en el README que una versión modificada debe usar otro nombre y otro icono.
- Las contribuciones que recibas quedan bajo GPL-3.0. Si algún día quisieras cambiar de licencia, necesitarías el permiso de cada contribuidor; para evitarlo se puede pedir un acuerdo de contribución (CLA).
- Si el proyecto forma parte de una asignatura o del TFG, revisa la normativa de la Universidad de Sevilla sobre la propiedad de los trabajos **antes de publicarlo**. Si no eres el único titular, la licencia tendría que acordarse con quien corresponda.

## Orden recomendado

1. Decidir el camino (A o B).
2. ~~Arreglar los huecos de tests y partir `useActiveWorkoutController.js`.~~ Hecho.
3. Capacitor + `platform.js` + plugins (pasos 3 y 4). Probar en tu móvil con ADB.
4. Ajustes de diseño (paso 5).
5. ~~Licencia~~ (hecha) y repositorio público (paso 9).
6. Cuenta de distribución limitada (gratis) para tus amigos, o Google Play con la prueba cerrada de 14 días.

## Fuentes

- [Requisitos de nivel de API de Google Play](https://developer.android.com/google/play/requirements/target-sdk)
- [Requisitos de Capacitor 8](https://capacitorjs.com/docs/updating/8-0)
- [Prueba cerrada para cuentas personales nuevas](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Calendario de verificación de desarrolladores fuera de la tienda (Android Authority)](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/)
