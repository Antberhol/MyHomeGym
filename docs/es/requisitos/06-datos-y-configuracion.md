# 6. Datos, configuración, avisos e idioma

[← Índice de requisitos](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## Requisitos funcionales

| Id | Requisito | Prioridad |
| --- | --- | --- |
| FR-6.01 | Todos los datos del usuario se guardan en la base de datos H2 del backend, en un fichero dentro de la carpeta de datos (`backend/data/` por defecto). | Must |
| FR-6.02 | El usuario puede descargar una copia completa de sus datos en JSON. | Must |
| FR-6.03 | El usuario puede restaurar una copia JSON. | Must |
| FR-6.04 | El usuario puede exportar sus entrenos a CSV e importarlos desde CSV. | Should |
| FR-6.05 | El usuario puede descargar un resumen en PDF con perfil, estadísticas, entrenos, récords y mediciones, en el idioma de la app. | Could |
| FR-6.06 | El usuario puede borrar todos sus datos, tras confirmarlo. | Must |
| FR-6.07 | El usuario puede activar un aviso de racha y elegir su hora. | Should |
| FR-6.08 | El usuario puede activar el aviso de fin de descanso. | Should |
| FR-6.09 | El usuario puede pedir permiso de avisos al navegador y enviar un aviso de prueba. | Should |
| FR-6.10 | La app está en español y en inglés; el usuario cambia de idioma en Configuración. | Must |
| FR-6.11 | La app se puede instalar como aplicación (PWA) y avisa cuando hay una versión nueva. | Should |

## Reglas de negocio

| Id | Regla |
| --- | --- |
| RN-6.01 | La copia JSON incluye perfil, ejercicios propios, carpetas, rutinas, ejercicios de rutina, entrenos, series, mediciones, récords y notas de ejercicio. El catálogo general no se incluye. |
| RN-6.02 | Antes de restaurar, la app comprueba que el fichero es una copia de MyHomeGym (JSON con la forma esperada y registros con id); si no lo es, no se envía nada y se avisa. Cada registro lo valida después el servidor con las mismas reglas que al guardarlo desde la app. |
| RN-6.03 | Restaurar *añade* lo que falta y no borra nada: los registros cuyo id ya existe (propio o de otro usuario) se saltan. El perfil sí se sustituye por el de la copia. La fusión la hace el servidor en una sola transacción: si un registro no es válido, no se añade ninguno. Al terminar se informa de cuántos registros se han añadido (el perfil cuenta como uno) y cuántos ya existían. |
| RN-6.04 | El CSV de entrenos tiene las columnas `id, rutinaId, fecha, duracionMinutos, volumenTotal, completado, notas`. Se exporta en UTF-8 con marca de orden de bytes (para que Excel muestre bien los acentos) y con todos los campos entre comillas. Al importar se admiten comas, comillas y saltos de línea dentro de un campo, y se descartan las filas sin id o sin una fecha válida. |
| RN-6.05 | Borrar todos los datos elimina perfil, ejercicios propios, rutinas, carpetas, entrenos, series, mediciones, récords y ajustes de avisos. La cuenta de usuario se conserva. |
| RN-6.06 | **Aviso de racha:** se envía si la racha es de 3 días o más, hoy no se ha entrenado y ya es la hora elegida (19:00 por defecto; el aviso viene activado). Si el usuario entrena antes de la hora, el aviso se cancela. Como mucho uno al día, y solo se da por enviado cuando ha salido de verdad. |
| RN-6.07 | Los avisos solo se envían si el navegador los permite y el usuario los ha activado. Su texto sale en el idioma de la app en el momento de enviarlo. |
| RN-6.08 | El cambio de idioma se aplica al momento, sin recargar, y se recuerda en el navegador. |
| RN-6.09 | Todo texto visible existe en `es.json` y en `en.json` con las mismas claves. Esto incluye los avisos, los mensajes de error, el PDF, el texto para compartir y el texto de una sesión copiada. |
| RN-6.10 | El service worker guarda en caché la interfaz, nunca las llamadas a `/api`. |
| RN-6.11 | Cada error del servidor lleva un código estable (`USERNAME_TAKEN`, `BAD_CREDENTIALS`, `TOO_MANY_ATTEMPTS`, `SESSION_EXPIRED`, `VALIDATION`, `BAD_JSON`, `NOT_FOUND`, `DUPLICATE_ID`). La app muestra el mensaje de ese código en el idioma del usuario, nunca el texto técnico. |
| RN-6.12 | Si una acción que guarda en el servidor falla y la pantalla no lo gestiona, aparece un aviso general con el motivo. Ningún fallo de guardado pasa en silencio. |
| RN-6.13 | El idioma del documento (`<html lang>`) sigue al idioma elegido en la app. |
| RN-6.14 | "Borrar caché y recargar", en la pantalla de error, borra lo guardado en el navegador salvo el idioma y el entreno en curso, que se conserva si se puede leer. Si hay un entreno en curso, la pantalla lo dice y ofrece descartarlo aparte, por si el error viene de él. |

## Pruebas de aceptación

### AC-6.1: Copia y restauración
- **Dado** un usuario con rutinas, entrenos y mediciones.
- **Cuando** descarga la copia, borra todos sus datos y restaura la copia.
- **Entonces** recupera exactamente los mismos datos.
- *Automatizado:* `ApiIntegrationTest.backupExportsAndRestoresUserData`.

### AC-6.2: Restaurar sobre datos existentes
- **Dado** un usuario con una rutina que también está en la copia.
- **Cuando** restaura una copia con esa rutina (con otro nombre), otra nueva, una carpeta y un ejercicio del catálogo general.
- **Entonces** tiene las dos rutinas y la carpeta, su rutina conserva su nombre, el ejercicio del catálogo no se importa, y el mensaje dice 2 registros añadidos y 2 que ya existían.
- **Y** si la copia trae un registro no válido, no se añade ninguno.
- **Y** una copia nunca trae a la cuenta registros de otro usuario.
- *Automatizado:* `DataIntegrityApiTest.mergeAddsWhatIsMissingWithoutDeletingAndIsAtomic` y `DataIntegrityApiTest.mergeNeverTakesAnotherUsersRecords`. Verificado además con prueba de navegador (17/11/2026).

### AC-6.3: Fichero no válido
- **Cuando** el usuario intenta restaurar un fichero que no es JSON, o un JSON cualquiera que no es una copia de MyHomeGym.
- **Entonces** ve "Ese fichero no es una copia de MyHomeGym" y sus datos no cambian.
- **Y** una copia exportada por la app (aunque tenga rutinas sin color) siempre se acepta.
- *Automatizado:* `backup-and-notes.test.js › rechaza un fichero que no es una copia de MyHomeGym, sin enviar nada`, `acepta una copia con rutinas sin color o sin fecha de exportación: lo que exporta la app se restaura` y `rechaza registros sin id`.

### AC-6.4: Borrar todos los datos
- **Cuando** el usuario pulsa "Borrar todos mis datos" y confirma.
- **Entonces** desaparecen sus rutinas, entrenos, mediciones y récords, pero puede seguir entrando con su usuario y contraseña.
- **Y** si cancela la confirmación, no se borra nada.
- *Manual.*

### AC-6.5: CSV
- **Cuando** el usuario descarga los entrenos en CSV y abre el fichero en una hoja de cálculo.
- **Entonces** ve una fila por entreno con las columnas de RN-6.04 y los acentos correctos.
- **Y** si importa ese mismo fichero en otra cuenta, recupera los entrenos, incluidas las notas de varias líneas.
- *Automatizado:* `exports.test.js` (bloque "CSV de entrenos", 3 casos).

### AC-6.6: Aviso de racha
- **Dado** que el usuario lleva 3 días seguidos, tiene el aviso activado a las 19:00 y hoy no ha entrenado.
- **Cuando** son las 19:00 con la app abierta.
- **Entonces** recibe un aviso de que su racha está en peligro, y no recibe otro ese mismo día.
- **Y** si entrena a las 18:00, a las 19:00 no recibe nada.
- **Y** si la app está en inglés, el aviso llega en inglés (también el de fin de descanso).
- *Automatizado:* `streaks-and-plates.test.js` (bloque "aviso de racha", 4 casos) y `notifications.test.js › salen en el idioma de la app`.

### AC-6.7: Cambio de idioma
- **Dado** que la app está en español.
- **Cuando** el usuario elige English en Configuración.
- **Entonces** la navegación, los botones y los textos cambian a inglés al instante y siguen en inglés al recargar.
- *Automatizado en parte:* `npm run check:i18n` comprueba que ambos idiomas tienen las mismas claves.

### AC-6.8: Backend apagado
- **Dado** que el backend no está arrancado.
- **Cuando** el usuario abre la app.
- **Entonces** ve un mensaje que explica que el servidor no responde, no un error técnico.
- *Automatizado:* `api.test.js › explica cuando el backend no está arrancado`.

### AC-6.9: Errores en el idioma del usuario
- **Dado** que la app está en inglés.
- **Cuando** el usuario intenta registrarse con un nombre que ya existe.
- **Entonces** ve "That username is already taken.", no el texto en español ni un mensaje técnico.
- **Y** un error de validación muestra un mensaje general comprensible, nunca "must not be blank".
- *Automatizado:* `api.test.js › traduce los errores del servidor a mensajes legibles, en el idioma de la app`, `nunca enseña el texto técnico del servidor` y `sin código, elige el mensaje por el tipo de fallo`.

### AC-6.10: PDF y textos exportados en el idioma de la app
- **Dado** que la app está en inglés.
- **Cuando** el usuario descarga el resumen en PDF o copia una sesión como texto.
- **Entonces** los títulos, las columnas y los tipos de récord salen en inglés.
- **Y** el PDF se genera aunque falten datos (una medición sin IMC, un entreno sin volumen).
- *Automatizado:* `exports.test.js` (bloques "resumen en PDF" y "copiar una sesión", 5 casos). Verificado además con prueba de navegador (17/11/2026).

### AC-6.11: Un fallo al guardar nunca pasa en silencio
- **Dado** que el servidor deja de responder.
- **Cuando** el usuario hace un cambio que no se puede guardar (por ejemplo, reordenar una rutina).
- **Entonces** aparece un aviso con el motivo, en su idioma, que desaparece solo a los pocos segundos.
- *Verificado con prueba de navegador (17/11/2026).*

### AC-6.12: Borrar la caché no pierde el entreno en curso
- **Dado** un entreno a medias y un error que muestra la pantalla de error.
- **Cuando** el usuario pulsa "Borrar caché y recargar".
- **Entonces** la app vuelve a cargar con el mismo idioma y el entreno en curso sigue ahí.
- **Y** si los datos del entreno estaban dañados, se descartan en vez de conservarse.
- *Automatizado:* `browser-cache.test.js › conserva el idioma y el entreno en curso y borra lo demás` y `descarta un entreno en curso que ya no se puede leer`.
