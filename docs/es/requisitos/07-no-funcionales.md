# 7. Requisitos no funcionales

[← Índice de la ERS](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

Clasificados según ISO/IEC 25010. Cada requisito tiene un **criterio medible** (*fit criterion*): una condición que se puede comprobar con un test, una medición o una revisión concreta. "Valor actual" indica la última medición, cuando existe.

## 7.1 Seguridad

| Id | Requisito | Criterio medible | Verificación |
| --- | --- | --- | --- |
| RNF-1.01 | Los datos de usuario se guardan solo en el servidor del propio usuario. | Ninguna petición saliente contiene datos de un usuario. Las únicas salientes son la traducción de textos del catálogo (servidor) y la carga de las fotos del catálogo (navegador). Las tipografías van dentro de la app: no se pide nada a Google. | Revisión de `TranslationService`, `application.yml` e `index.html` |
| RNF-1.02 | Las contraseñas no se guardan ni se registran en claro. | La base de datos solo contiene hashes BCrypt; ningún log contiene la contraseña. | Revisión de `SecurityConfig` y `AuthService` |
| RNF-1.03 | El token de acceso no es accesible tras cerrar la pestaña; el de refresco no es accesible desde JavaScript. | El token de acceso no está en `localStorage` ni `sessionStorage`; la cookie de refresco tiene `HttpOnly`, `SameSite=Strict`, `Path=/api/auth`, y `Secure` con `APP_COOKIES_SECURE=true`. | `api.test.js`, revisión de `AuthController` |
| RNF-1.04 | Ningún endpoint de datos responde sin un token válido. | El 100 % de los endpoints bajo `/api` salvo `/api/auth/**`, `/api/catalog/**` y `/api/health` responden 401 sin token. | `ApiIntegrationTest.protectedEndpointsRequireToken` |
| RNF-1.05 | Un usuario no puede leer ni modificar datos de otro. | Leer, modificar, borrar o crear con el id de un dato ajeno responde como si no existiera, y el dato no cambia. | `ApiIntegrationTest.usersCannotSeeOrOverwriteEachOthersData`, `ExerciseNotesApiTest` |
| RNF-1.06 | Fuerza bruta limitada. | Tras 5 fallos seguidos, la cuenta no admite inicios de sesión durante 15 minutos. | `ApiIntegrationTest.loginFailsWithWrongPasswordAndLocksAfterRepeatedFailures` |
| RNF-1.07 | No hay secretos en el repositorio. | `git grep` no encuentra claves; `backend/data/` está en `.gitignore`. | Revisión antes de cada publicación |
| RNF-1.08 | Validación en el servidor de todo lo que se guarda. | Un registro que incumple sus restricciones de [10](10-requisitos-de-informacion.md) se rechaza con 400 y no se guarda nada, tanto al guardarlo desde la app como al restaurar una copia. | `DataIntegrityApiTest.invalidValuesAreRejected`, `DataIntegrityApiTest.mergeAddsWhatIsMissingWithoutDeletingAndIsAtomic`, `ExerciseNotesApiTest.noteWithoutExerciseIsRejected` |
| RNF-1.09 | Dependencias sin vulnerabilidades conocidas. | `npm audit` informa de 0 vulnerabilidades, también en las herramientas de desarrollo. Se revisa antes de cada versión. | **0** (17/11/2026; `glob` de workbox forzado a 14.0.6 con `overrides`) |

## 7.2 Fiabilidad

| Id | Requisito | Criterio medible | Verificación |
| --- | --- | --- | --- |
| RNF-2.01 | Las operaciones compuestas son atómicas. | Guardar un entreno, borrar un entreno, borrar una rutina, borrar una carpeta, borrar un ejercicio propio, reordenar ejercicios y restaurar una copia: o se aplican enteras o no se aplica nada. | `ApiIntegrationTest.completedTrainingIsSavedWithItsSetsAndDeletedTogether`, `DataIntegrityApiTest` (6 casos), `@Transactional` |
| RNF-2.02 | Un entreno en curso no se pierde. | Tras recargar o cerrar la pestaña en mitad de un entreno, se recuperan el 100 % de las series y valores escritos. | AC-3.3 (prueba de navegador) |
| RNF-2.03 | Un fallo al guardar no pierde el entreno. | Si el servidor falla al terminar, el usuario ve un aviso y el entreno sigue abierto; al reintentar, se guarda una sola vez. | AC-3.9 (prueba de navegador) |
| RNF-2.04 | Los servicios externos no son imprescindibles. | Con el traductor y GitHub caídos, todas las pantallas funcionan (con textos en inglés e iconos en lugar de fotos). | AC-5.4, `CatalogAndTranslationTest` |
| RNF-2.05 | Un error de pantalla no deja la app en blanco. | Cualquier excepción de React muestra el aviso de error con un botón para recargar. | `ErrorFallback` (revisión) |
| RNF-2.06 | Ningún fallo al guardar pasa en silencio. | Toda escritura que falla muestra un aviso al usuario, en la propia pantalla o en el aviso general (RN-6.12). | AC-6.11 (prueba de navegador) |
| RNF-2.07 | El reloj del entreno es fiable. | Tras 10 minutos con la app en segundo plano, el cronómetro y el descanso difieren menos de 1 s de la hora real (RN-3.10). | `workout-timer.test.js` |

## 7.3 Usabilidad y accesibilidad

| Id | Requisito | Criterio medible | Verificación |
| --- | --- | --- | --- |
| RNF-3.01 | Diseño para móvil y una mano. | Todas las pantallas se usan a 390 px de ancho sin desplazamiento horizontal; las acciones del entreno están en la mitad inferior o en la cabecera fija. | Prueba en navegador a 390 × 844 |
| RNF-3.02 | Registrar una serie es rápido. | Marcar una serie con los valores de la última vez cuesta **1 toque**; corregir kilos o repeticiones, como mucho 2 toques más el teclado. | Prueba manual del entreno guiado |
| RNF-3.03 | Objetivos táctiles cómodos. | Todos los controles de las pantallas de entreno (elegir rutina, tabla de series, opciones de serie, descanso, menú) miden al menos 44 × 44 px. Objetivo para Android: 48 dp (EVO-04). | Medido con prueba de navegador a 390 × 844 (17/11/2026) |
| RNF-3.04 | Foco de teclado visible. | Todo control enfocable muestra un contorno con `:focus-visible`. | `index.css`, prueba con teclado |
| RNF-3.05 | Contraste suficiente. | El texto sobre colores de rutina o disco tiene contraste ≥ 4,5:1 (se elige tinta oscura o clara automáticamente). | `ui-rules.test.js › usa tinta oscura sobre colores claros y tiza sobre oscuros` |
| RNF-3.06 | Controles sin texto con nombre accesible. | Todo botón de icono, cada serie de la tabla y la figura del cuerpo tienen `aria-label` traducido. | Revisión; las pruebas de navegador los localizan por su nombre accesible |
| RNF-3.07 | Las pantallas vacías orientan. | Toda lista o gráfica sin datos muestra un mensaje que explica qué hacer y la acción para hacerlo. | AC-4.6 y revisión |
| RNF-3.08 | Mensajes de error comprensibles. | Ningún mensaje al usuario muestra el texto técnico del servidor, códigos HTTP, trazas ni claves de traducción. Cada error del servidor lleva un código que la app traduce (RN-6.11). | `api.test.js › nunca enseña el texto técnico del servidor` y `sin código, elige el mensaje por el tipo de fallo` |

## 7.4 Diseño

| Id | Requisito | Criterio medible | Verificación |
| --- | --- | --- | --- |
| RNF-4.01 | Solo se usan los tokens del sistema de diseño. | Cada color con variable CSS tiene su valor en `theme.css`; no hay colores sueltos en los componentes salvo los de datos (discos). | `theme.test.js › cada color del sistema que sale de una variable tiene su valor en theme.css` |
| RNF-4.02 | Significado del color constante. | El violeta `gym-accent` solo en acciones; `gym-danger` en errores y borrar; los colores `plate-*` solo en datos. | `theme.test.js › el color de acción no se usa para errores ni para borrar` |
| RNF-4.03 | Modo oscuro único. | No existe selector de tema; todas las pantallas usan los fondos de `theme.css`. | Revisión |

## 7.5 Eficiencia de desempeño

| Id | Requisito | Criterio medible | Valor actual / verificación |
| --- | --- | --- | --- |
| RNF-5.01 | Respuesta inmediata al registrar una serie. | Marcar una serie actualiza la pantalla en menos de 100 ms, sin esperar al servidor (se guarda en local hasta terminar). | Diseño: el entreno en curso no hace peticiones por serie |
| RNF-5.02 | Carga inicial ligera. | El JavaScript inicial ocupa menos de 200 KB comprimido; cada pantalla se carga bajo demanda. | **128 KB** gzip (compilación del 17/11/2026, versión 1.0.0-beta.1) |
| RNF-5.03 | Catálogo fluido. | La rejilla pinta de 40 en 40 y el buscador usa lista virtual: abrir el catálogo no pinta los 876 ejercicios a la vez. | Revisión de `ExerciseGrid` y `ExercisePicker` |
| RNF-5.04 | Peticiones rápidas en red local. | El 95 % de las peticiones a la API responden en menos de 300 ms con un servidor en la misma red y menos de 10.000 series guardadas. | Medición manual con las herramientas del navegador |
| RNF-5.05 | Lecturas cacheadas. | Una lectura repetida no vuelve a pedirse al servidor hasta que hay una escritura. | `api.test.js › cachea las lecturas y las invalida tras una escritura` |

## 7.6 Mantenibilidad

| Id | Requisito | Criterio medible | Verificación |
| --- | --- | --- | --- |
| RNF-6.01 | Definición de terminado. | Pasan `./mvnw verify`, `npm run lint` (0 errores), `npm test`, `npm run check:i18n` y `npm run build`. | CI en `.github/workflows` |
| RNF-6.02 | Ficheros pequeños. | Ningún fichero de código supera unas 300 líneas. | Revisión (`wc -l`) |
| RNF-6.03 | Reglas de negocio probadas. | Cada regla de negocio (RN) tiene al menos un test automático o una prueba de aceptación con su estado indicado. | Matriz de [13-trazabilidad.md](13-trazabilidad.md) |
| RNF-6.04 | Lógica separada de la interfaz. | Los cálculos (volumen, 1RM, progresión, rachas, récords, mapa muscular, discos) son funciones puras en `src/utils` o `src/lib`, sin React. | Revisión; se prueban sin renderizar componentes |
| RNF-6.05 | Traducciones completas. | `es.json` y `en.json` tienen exactamente las mismas claves. | `npm run check:i18n` |
| RNF-6.06 | Documentación al día. | Toda funcionalidad nueva actualiza su módulo de requisitos y `FUNCIONALIDAD.md` (ver `CONTRIBUTING.md`). | Revisión en cada cambio |

## 7.7 Portabilidad y compatibilidad

| Id | Requisito | Criterio medible | Verificación |
| --- | --- | --- | --- |
| RNF-7.01 | Multiplataforma para desarrollar y desplegar. | Compila y arranca en Windows, macOS y Linux con Java 21 y Node.js 22. | `mvnw` y `mvnw.cmd`; probado en Windows 11 y Linux |
| RNF-7.02 | Despliegue en un solo proceso. | Con `npm run build:backend` y `mvnw spring-boot:run`, toda la app se sirve desde el puerto 8080 y las rutas de la app devuelven `index.html` al recargar. | `SpaRoutesTest.reactRoutesForwardToIndex` |
| RNF-7.03 | Instalable. | La app se puede instalar como PWA desde Chrome en Android y en escritorio. | Prueba manual |
| RNF-7.04 | Navegadores soportados. | Funciona en las dos últimas versiones de Chrome, Edge, Firefox y Safari. | Prueba manual |
| RNF-7.05 | Preparada para Android. | Las pantallas no dependen del backend directamente, solo de `db.js` (RES-04), para poder sustituirlo por almacenamiento local (EVO-02). | Revisión |
| RNF-7.06 | La interfaz funciona sin conexión a servicios de terceros. | Con Internet cortado y el servidor accesible, la app carga con sus tipografías; solo faltan las fotos del catálogo y las traducciones nuevas. | Revisión: no hay peticiones a dominios externos salvo las fotos del catálogo |
