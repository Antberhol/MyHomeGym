# 11. Restricciones, supuestos, evolución y riesgos

[← Índice de la ERS](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## 11.1 Restricciones

Condiciones que limitan **cómo** se puede construir el sistema. No son negociables sin cambiar esta ERS.

| Id | Restricción | Tipo | Fuente |
| --- | --- | --- | --- |
| RES-01 | Backend en Java 21 con Spring Boot 3.5 y Maven. | Tecnológica | Autor |
| RES-02 | Frontend en JavaScript con React y Vite. **Sin TypeScript.** | Tecnológica | Autor |
| RES-03 | Base de datos H2 en un fichero dentro de la carpeta de datos (`backend/data/` por defecto). Un único proceso puede abrirla a la vez. | Tecnológica | Autor |
| RES-04 | Las pantallas acceden a los datos solo a través de repositorios → `lib/db.js` → `lib/api.js`. | Arquitectónica | Autor |
| RES-05 | Los recursos de usuario extienden `OwnedEntity` y `OwnedCrudController`; el propietario sale del JWT. | Arquitectónica, seguridad | Autor |
| RES-06 | Todo texto visible está en `es.json` y `en.json` con las mismas claves. | Internacionalización | Autor |
| RES-07 | Estilos solo con los tokens del sistema de diseño (`tailwind.config.js`, `styles/theme.css`). | Diseño | Autor |
| RES-08 | Ningún fichero de código supera unas 300 líneas. | Mantenibilidad | Autor |
| RES-09 | Sin secretos en el repositorio. La clave JWT se genera en la carpeta de datos. | Seguridad | Autor |
| RES-10 | Los datos de terceros se usan respetando su licencia: free-exercise-db (The Unlicense), js-rich-body-highlighter (MIT), Barlow y Big Shoulders Display (SIL OFL 1.1). Se acreditan en el fichero `NOTICE`. | Legal | Legal |
| RES-13 | El código se distribuye bajo GPL-3.0-or-later: toda dependencia nueva debe tener una licencia compatible (MIT, BSD, Apache-2.0, MPL-2.0, OFL o similar). | Legal | Autor |
| RES-11 | La app no da consejo médico ni promete resultados de salud. | Legal | Legal, Plataforma |
| RES-12 | Un único desarrollador mantiene el sistema: se prefiere tecnología conocida y sin servicios que haya que operar. | Organizativa | Autor |

## 11.2 Supuestos

Cosas que se dan por ciertas. Si alguna deja de serlo, hay que revisar los requisitos afectados.

| Id | Supuesto | Requisitos afectados si falla |
| --- | --- | --- |
| SUP-01 | El usuario usa un navegador moderno (Chrome, Edge, Firefox o Safari de los dos últimos años). | RNF-7.x |
| SUP-02 | El backend está encendido y accesible desde el dispositivo del usuario mientras usa la app. | Todos los FR salvo el entreno en curso |
| SUP-03 | Cada servidor lo usan pocas personas (de 1 a 5), normalmente de la misma casa. | RNF-5.x |
| SUP-04 | Los pesos se expresan en kilogramos y los perímetros en centímetros. | RI-02, RI-03, RI-07 |
| SUP-05 | El usuario entrena como mucho una o dos veces al día. | RN-4.01 |
| SUP-06 | El reloj del dispositivo tiene la hora y la zona horaria correctas. | RN-4.01 a RN-4.03, RN-6.06 |

## 11.3 Dependencias externas

| Dependencia | Para qué | Si no está disponible |
| --- | --- | --- |
| Servicio de traducción (MyMemory o LibreTranslate) | Traducir las instrucciones del catálogo la primera vez | Las instrucciones salen en inglés con un aviso (RN-5.06). Se puede desactivar con `APP_TRANSLATION_PROVIDER=none`. |
| GitHub (fotos de free-exercise-db) | Mostrar las fotos de los ejercicios | Se muestra un icono neutro (FR-5.05). |

## 11.4 Fuera del alcance de esta versión (*Won't*)

- Unidades imperiales (libras, pulgadas).
- Modo claro.
- Sincronización entre dispositivos sin servidor propio.
- Compartir rutinas entre usuarios, rankings o red social.
- Generación automática de rutinas.
- Integración con relojes, pulsómetros o Google Fit / Health Connect.

## 11.5 Evolución prevista

Requisitos **propuestos**, aún no implementados. Están decididos por el autor, pero sin fecha.

| Id | Requisito | Prioridad | Estado |
| --- | --- | --- | --- |
| EVO-01 | El sistema deberá poder instalarse como app de Android nativa (Capacitor), manteniendo la versión web. | Should | Propuesto |
| EVO-02 | En la versión de Android, todos los datos se guardarán en el propio móvil (SQLite), **sin servidor ni cuentas** (camino B de [ANDROID.md](../ANDROID.md)). La capa `db.js` se sustituye manteniendo su interfaz. | Should | Propuesto |
| EVO-03 | En la versión de Android, el catálogo y sus traducciones irán empaquetados dentro de la app y funcionarán sin conexión. | Should | Propuesto |
| EVO-04 | En la versión de Android, los avisos, la vibración, la pantalla siempre encendida durante el entreno, el gesto de atrás y la exportación de ficheros usarán las APIs nativas. | Should | Propuesto |
| EVO-05 | El código se publicará bajo una licencia libre que obligue a mantener la autoría y a publicar las modificaciones que se distribuyan. | Could | **Implementado** (GPL-3.0-or-later, ficheros `LICENSE` y `NOTICE`). Falta publicar el repositorio. |

Con EVO-02 dejan de aplicar en Android: RI-01, FR-1.01 a FR-1.04, RN-1.01 a RN-1.08 y SUP-02. OBJ-07 se cumple guardando los datos en el móvil en lugar del servidor.

## 11.6 Mejoras detectadas

| Id | Mejora | Requisito relacionado | Estado |
| --- | --- | --- | --- |
| MEJ-01 | Avisar al usuario si falla el guardado del nuevo orden de los ejercicios de una rutina. | FR-2.07, CU-07 | Resuelta en la 2.1 (RN-6.12) |
| MEJ-02 | El récord de sesión guarda su detalle en español fijo ("Volumen total de sesión"). | RN-6.09 | Resuelta en la 2.1 (RN-4.08) |
| MEJ-03 | Las instrucciones traducidas automáticamente mezclan "tú" y "usted". | FR-5.07 | Resuelta en la 2.2 (RN-5.13) |
| MEJ-04 | El servidor admite 0 series en un ejercicio de rutina, aunque el formulario no lo permite. | RI-05 | Resuelta en la 2.1 (RN-2.10) |
| MEJ-05 | Al corregir kilos o repeticiones de una sesión pasada no se recalculan los récords. | FR-3.19, RN-4.05 | Resuelta en la 2.2 (RN-4.15) |
| MEJ-06 | Quedan 5 avisos de seguridad leves o moderados en herramientas de desarrollo (vite, vite-plugin-pwa); arreglarlos exige una versión incompatible. No afectan a lo que se entrega al usuario. | RNF-1.09 | Resuelta en la 2.2: `glob` forzado a una versión corregida (RNF-1.09) |
| MEJ-07 | "Borrar caché y recargar", en la pantalla de error, borra también un entreno en curso. | RNF-2.02 | Resuelta en la 2.2 (RN-6.14): se conserva y se puede descartar aparte |
| MEJ-08 | El asistente inicial se saltaba el paso del IMC: al pulsar Siguiente en el segundo paso, el formulario se enviaba. | FR-1.05, AC-1.7 | Resuelta en la 2.2 |

## 11.7 Riesgos

| Id | Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- | --- |
| RSG-01 | Pérdida de datos por fallo del disco del servidor | Media | Alto | Copia JSON periódica (FR-6.02); la carpeta de datos es un único directorio fácil de copiar. |
| RSG-02 | El servicio de traducción gratuito desaparece o limita las peticiones | Media | Bajo | Caché permanente (RN-5.05) y modo sin traducción. |
| RSG-03 | Cambian las reglas de Google Play o de Android | Alta | Medio | Revisar cada año los requisitos de [ANDROID.md](../ANDROID.md). |
| RSG-04 | El mantenedor deja de tener tiempo | Media | Medio | Tests, CI, esta ERS y `AGENTS.md` reducen el coste de retomar el proyecto. |
| RSG-05 | Una librería pequeña (la figura anatómica) deja de mantenerse | Media | Bajo | Licencia MIT: se puede copiar dentro del proyecto. |
