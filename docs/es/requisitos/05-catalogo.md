# 5. Catálogo de ejercicios

[← Índice de requisitos](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## Requisitos funcionales

| Id | Requisito | Prioridad |
| --- | --- | --- |
| FR-5.01 | La app incluye un catálogo de 876 ejercicios de free-exercise-db (dominio público), servido por el backend. | Must |
| FR-5.02 | Cada ejercicio tiene nombre en español, nombre original, músculos principales y secundarios, material, nivel, mecánica, tipo de fuerza, categoría, dos fotos e instrucciones. | Must |
| FR-5.03 | El usuario puede buscar por texto en el nombre en español o en el original. | Must |
| FR-5.04 | El usuario puede filtrar por grupo muscular, material y nivel, y ver solo sus ejercicios propios. | Must |
| FR-5.05 | La ficha alterna las dos fotos como animación; si una imagen no carga, muestra un icono neutro. | Should |
| FR-5.06 | La ficha muestra el historial del usuario con ese ejercicio: peso máximo, 1RM, sesiones recientes, gráfica y récords. | Should |
| FR-5.07 | Las instrucciones se traducen automáticamente al español la primera vez que se piden. | Should |
| FR-5.08 | El usuario puede crear, editar y borrar ejercicios propios con nombre, grupo muscular, material e instrucciones. | Must |
| FR-5.09 | El usuario puede guardar una nota personal por ejercicio, que se conserva en cualquier dispositivo y en la copia de seguridad. | Could |

## Reglas de negocio

| Id | Regla |
| --- | --- |
| RN-5.01 | El catálogo vive en `backend/src/main/resources/catalog/exercises/`: un fichero JSON por músculo principal y un ejercicio por línea. Cada ejercicio está en el fichero de su primer músculo principal, aunque trabaje otros como secundarios. |
| RN-5.02 | Los ids del catálogo son únicos entre todos los ficheros; el backend no arranca si hay uno repetido. |
| RN-5.03 | Los nombres en español (`nameEs`) están traducidos a mano y no pueden estar vacíos. |
| RN-5.04 | Músculos, material, nivel y categoría usan un vocabulario fijo traducido; todo ejercicio pertenece a un grupo muscular conocido. |
| RN-5.05 | La traducción automática de instrucciones se guarda en caché en la base de datos y no se vuelve a pedir. |
| RN-5.06 | Si el traductor falla o está desactivado (`APP_TRANSLATION_PROVIDER=none`), la ficha muestra los pasos en inglés y lo avisa. Un fallo no se guarda en caché. |
| RN-5.07 | La búsqueda ignora mayúsculas y tildes. |
| RN-5.08 | El catálogo es público (no necesita sesión); los ejercicios propios son privados de cada usuario. |
| RN-5.09 | La rejilla carga de 40 en 40 ejercicios. |
| RN-5.10 | Hay como mucho una nota por usuario y ejercicio, de hasta 4.000 caracteres, guardada en el servidor (`/api/exercise-notes`). Es privada de cada usuario. |
| RN-5.11 | Las notas que versiones antiguas guardaban solo en el navegador se suben al servidor la primera vez y se borran del navegador. Nunca sustituyen a una nota que ya esté en el servidor. |
| RN-5.12 | Borrar un ejercicio propio lo quita de las rutinas que lo usaban y borra su nota, en la misma transacción. Las series ya registradas con él se conservan como historial. |
| RN-5.13 | Las instrucciones traducidas al español tratan siempre de tú, como el resto de la app: los imperativos de usted más frecuentes ("mantenga", "colóquese", "bájela"), "usted" y "su"/"sus" delante de una parte del cuerpo se pasan a tú. Las palabras que también son sustantivos ("agarre", "ajuste") no se tocan. Se aplica también a las traducciones ya guardadas en caché. |

## Pruebas de aceptación

### AC-5.1: Formato del catálogo
- **Dado** los ficheros de `catalog/exercises/`.
- **Entonces** cada línea es un ejercicio completo, cada ejercicio está en el fichero de su músculo principal, no hay ids repetidos, hay 876 en total y todos tienen nombre en español.
- *Automatizado:* `CatalogFilesTest.eachFileHoldsOneMuscleAndOneExercisePerLine` y `CatalogAndTranslationTest.everyExerciseHasASpanishNameAndAKnownGroup`.

### AC-5.2: Catálogo público y traducido
- **Cuando** se pide `/api/catalog/exercises` sin sesión.
- **Entonces** responde con los ejercicios con su nombre en español.
- *Automatizado:* `ApiIntegrationTest.catalogIsPublicAndTranslated`.

### AC-5.3: Ficha con fotos propias
- **Dado** que el usuario abre "Sentadilla con barra".
- **Entonces** ve sus dos fotos alternándose, su nombre en español y su nombre original, sus músculos y su nivel.
- *Manual.*

### AC-5.4: Traducción no disponible
- **Dado** que el servicio de traducción no responde.
- **Cuando** el usuario abre la ficha de un ejercicio.
- **Entonces** ve los pasos en inglés y un aviso de que la traducción no está disponible.
- **Y** cuando el servicio vuelve, la siguiente apertura sí traduce.
- *Automatizado:* `CatalogAndTranslationTest.translationsAreCachedAndFailuresFallBackToOriginal`.

### AC-5.5: Buscar y filtrar
- **Cuando** el usuario escribe "press banca" y filtra por material "Barra".
- **Entonces** ve solo ejercicios de press de banca con barra, y el botón de filtros indica 1 filtro activo.
- **Y** escribir "Bench" encuentra los mismos ejercicios por su nombre original.
- *Manual.*

### AC-5.6: Nota personal en el servidor
- **Dado** que el usuario escribe "Rodillas hacia fuera" en la nota de la sentadilla y la guarda.
- **Cuando** recarga la página o entra desde otro dispositivo.
- **Entonces** ve la misma nota; otro usuario no la ve; y la nota viaja en la copia JSON.
- **Y** si tenía una nota antigua guardada solo en el navegador, aparece en la ficha y deja de estar en el navegador.
- *Automatizado:* `ExerciseNotesApiTest.notesArePrivateAndTravelWithTheBackup`, `ExerciseNotesApiTest.noteWithoutExerciseIsRejected` y `backup-and-notes.test.js` (casos de notas).

### AC-5.7: Ejercicio propio
- **Cuando** el usuario crea "Remo en TRX" en el grupo Espalda con material TRX.
- **Entonces** aparece en el catálogo con la etiqueta de ejercicio propio, se puede añadir a rutinas y no lo ve ningún otro usuario.
- *Manual.*

### AC-5.8: Borrar un ejercicio propio
- **Dado** un ejercicio propio que está en una rutina, tiene una nota y aparece en un entreno ya hecho.
- **Cuando** el usuario lo borra.
- **Entonces** desaparece de la rutina (los demás ejercicios siguen) y su nota se borra.
- **Y** las series del entreno ya hecho se conservan.
- *Automatizado:* `DataIntegrityApiTest.deletingACustomExerciseRemovesItFromRoutinesAndKeepsHistory`.

### AC-5.9: Instrucciones siempre de tú
- **Dado** que el traductor devuelve "Coloca los pies… Mantenga su espalda recta y colóquese debajo de la barra".
- **Cuando** el usuario abre la ficha en español.
- **Entonces** lee "Coloca los pies… Mantén tu espalda recta y colócate debajo de la barra".
- **Y** "Usa un agarre prono" se queda igual.
- *Automatizado:* `SpanishRegisterTest.mixedInstructionsEndUpInTu`, `SpanishRegisterTest.leavesNounsAndTextAlreadyInTuUntouched` y `SpanishRegisterTest.appliesOnlyToSpanishAndToCachedTranslationsToo`.
