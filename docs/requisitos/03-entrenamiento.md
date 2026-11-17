# 3. Entrenamiento

[← Índice de requisitos](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## Requisitos funcionales

| Id | Requisito | Prioridad |
| --- | --- | --- |
| FR-3.01 | El usuario puede empezar un entreno guiado a partir de una de sus rutinas. | Must |
| FR-3.02 | El usuario puede empezar un entreno libre y añadir ejercicios sobre la marcha desde un buscador. | Must |
| FR-3.03 | En cada ejercicio se ve, por serie, lo que se hizo la última vez junto a los campos de kilos y repeticiones de hoy. | Must |
| FR-3.04 | El usuario marca cada serie como hecha; puede desmarcarla. | Must |
| FR-3.05 | Cada serie tiene un tipo (normal, calentamiento, drop set o al fallo) y un esfuerzo RPE opcional (6, 7, 7,5, 8, 8,5, 9, 9,5 o 10). | Should |
| FR-3.06 | El usuario puede añadir y quitar series, y quitar ejercicios en el entreno libre. | Must |
| FR-3.07 | Al marcar una serie como hecha arranca un temporizador de descanso con la duración de la rutina. | Must |
| FR-3.08 | El descanso se puede alargar o acortar 15 segundos y saltar. | Should |
| FR-3.09 | Al acabar el descanso suena un pitido doble, el móvil vibra si lo admite y, si el aviso está activado y la app está en segundo plano, llega una notificación. | Should |
| FR-3.10 | Un cronómetro mide el entreno y se puede pausar y reanudar. | Must |
| FR-3.11 | La app sugiere subir 2,5 kg cuando toca (doble progresión) y aplica la subida con un toque. | Should |
| FR-3.12 | En el entreno libre, un ejercicio ya hecho antes llega con las series de la última vez rellenas. | Should |
| FR-3.13 | El usuario puede escribir una nota por ejercicio durante la sesión. | Could |
| FR-3.14 | Desde el entreno se abre una calculadora de discos. | Should |
| FR-3.15 | El usuario puede descartar el entreno en curso. | Must |
| FR-3.16 | Si se cierra o recarga la app durante un entreno, al volver se recupera tal como estaba. | Must |
| FR-3.17 | Al terminar se guarda el entreno y se muestra un resumen con duración, volumen, series, desglose por ejercicio, notas y récords batidos. | Must |
| FR-3.18 | Desde el resumen se puede compartir una imagen de la sesión. | Could |
| FR-3.19 | Una sesión pasada se puede abrir desde Inicio para corregir kilos y repeticiones, o copiarla como texto o CSV. Al guardar la corrección se recalculan su volumen y los récords afectados (RN-4.15). | Should |

## Reglas de negocio

| Id | Regla |
| --- | --- |
| RN-3.01 | **Doble progresión:** se sugiere subir 2,5 kg solo si en la sesión anterior de ese ejercicio *todas* las series de trabajo llegaron al máximo del rango de repeticiones objetivo. Con un objetivo fijo (`5`), el máximo es ese número. La sugerencia es el peso de la serie más pesada + 2,5 kg. |
| RN-3.02 | Las series de calentamiento no suben de peso al aplicar la sugerencia y no cuentan para decidirla. |
| RN-3.03 | La "última vez" de un ejercicio es su sesión más reciente anterior al momento actual. |
| RN-3.04 | La duración guardada es la del cronómetro en minutos, sin contar las pausas, salvo que el usuario la cambie a mano. |
| RN-3.05 | El entreno y todas sus series se guardan en una única transacción: o todo o nada. Si ya existe un entreno o una serie con ese id, se rechaza. |
| RN-3.06 | Borrar un entreno borra también sus series. |
| RN-3.07 | Volumen de una serie = kilos × repeticiones. El volumen de un entreno es la suma de sus series que no son de calentamiento. |
| RN-3.08 | El estado del entreno en curso se guarda en el navegador (`localStorage`) a cada cambio y se borra al terminar o descartar. |
| RN-3.09 | **Calculadora de discos:** reparte (objetivo − barra) / 2 por lado con discos de 25, 20, 15, 10, 5, 2,5 y 1,25 kg, de mayor a menor. Si no es exacto, informa del peso más cercano por debajo y de la diferencia. Barra por defecto: 20 kg. |
| RN-3.10 | El cronómetro y el descanso se calculan con la hora real, no contando segundos: siguen siendo correctos aunque el móvil se bloquee o la app pase a segundo plano. Al volver, el descanso que ya ha vencido termina en el acto. |
| RN-3.11 | El aviso de fin de descanso se programa para la hora exacta de fin. Si el descanso se alarga o se acorta, se reprograma; si se salta, se cancela. Saltar el descanso no suena ni vibra. |
| RN-3.12 | Una serie admite RPE de 1 a 10 y uno de los cuatro tipos (`normal`, `warmup`, `dropset`, `failure`); el servidor rechaza otros valores. |

## Pruebas de aceptación

### AC-3.1: Marcar una serie y descansar
- **Dado** un entreno guiado con descanso de 90 s.
- **Cuando** el usuario escribe 50 kg y 10 repeticiones y marca la serie.
- **Entonces** la serie queda marcada como hecha y aparece la cuenta atrás desde 1:30.
- **Y** +15 la sube a 1:45, y Saltar la cierra en silencio.
- *Verificado con prueba de navegador (17/11/2026). Las reglas del descanso están automatizadas en* `workout-timer.test.js`.

### AC-3.2: Sugerencia de peso
- **Dado** que la última vez hizo 3 series de 60 kg × 12 con objetivo `8-12`.
- **Cuando** empieza ese ejercicio.
- **Entonces** ve la sugerencia de subir a 62,5 kg y, al pulsar Subir, sus series de trabajo pasan a 62,5 kg.
- **Y** si en una de esas series hubiera hecho 11 repeticiones, no aparece la sugerencia.
- **Y** los calentamientos ni cuentan para decidirla ni suben de peso.
- *Automatizado:* `workout-rules.test.js` (bloque "doble progresión", 6 casos).

### AC-3.3: Recuperar un entreno
- **Dado** un entreno a medias con dos series marcadas.
- **Cuando** se recarga la página.
- **Entonces** el entreno sigue abierto en el mismo ejercicio, con las dos series marcadas y los mismos datos.
- *Verificado con prueba de navegador (Playwright) el 13/11/2026.*

### AC-3.4: Guardar un entreno de forma atómica
- **Dado** un entreno con varias series.
- **Cuando** el usuario pulsa Terminar.
- **Entonces** el entreno y sus series quedan guardados juntos, y al borrar el entreno se borran sus series.
- *Automatizado:* `ApiIntegrationTest.completedTrainingIsSavedWithItsSetsAndDeletedTogether`.

### AC-3.5: Resumen
- **Dado** que el usuario termina un entreno de 42 minutos en el que bate un récord.
- **Entonces** el resumen muestra 42 minutos, el volumen sin calentamientos, las series hechas, el desglose por ejercicio y "Has batido 1 récord personal en esta sesión".
- *Manual.*

### AC-3.6: Entreno libre con historial
- **Dado** que la última vez hizo sentadilla con 100 × 5, 110 × 5 y 115 × 3.
- **Cuando** añade sentadilla en un entreno libre.
- **Entonces** llega con esas tres series rellenas y sin marcar.
- *Automatizado en parte:* `workout-rules.test.js › toma la sesión más reciente anterior a ahora, con las series en orden`.

### AC-3.7: Calculadora de discos
- **Dado** un objetivo de 100 kg con barra de 20 kg.
- **Entonces** indica por lado 25 + 15 y lo dibuja.
- **Y** con un objetivo de 101 kg indica que no es exacto y que lo más cerca es 100 kg.
- *Automatizado:* `streaks-and-plates.test.js` (bloque "calculadora de discos", 5 casos).

### AC-3.8: Corregir una sesión pasada
- **Dado** una sesión en "Últimas sesiones".
- **Cuando** el usuario la abre, cambia una serie de 80 a 82,5 kg y guarda.
- **Entonces** la serie y el volumen total del entreno se actualizan.
- *Manual.*

### AC-3.9: Fallo al guardar el entreno
- **Dado** un entreno con series hechas y el servidor sin responder.
- **Cuando** el usuario pulsa Terminar.
- **Entonces** ve "No se ha podido guardar el entreno…", el cronómetro sigue y el entreno sigue abierto con todos sus datos.
- **Y** cuando el servidor vuelve y pulsa Terminar otra vez, el entreno se guarda una sola vez.
- *Verificado con prueba de navegador (Playwright, cortando la petición) el 13/11/2026.*

### AC-3.10: Series que se guardan
- **Dado** un entreno con una serie de 5 repeticiones y otra con 0 repeticiones.
- **Entonces** solo se guarda la primera. Una serie con 0 kg (peso corporal) sí se guarda.
- *Automatizado:* `workout-rules.test.js › solo guarda las series con repeticiones y usa la rutina si la hay`.

### AC-3.11: El móvil se bloquea durante el entreno
- **Dado** un entreno en marcha con un descanso de 90 s recién empezado.
- **Cuando** el usuario bloquea el móvil y vuelve 200 s después.
- **Entonces** el cronómetro del entreno ha avanzado esos 200 s y el descanso ha terminado, con un solo aviso.
- **Y** si había pausado el entreno, el tiempo en pausa no cuenta.
- *Automatizado:* `workout-timer.test.js` (bloque "useWorkoutTimer", 5 casos).

### AC-3.12: Aviso de fin de descanso
- **Dado** el aviso de fin de descanso activado y un descanso de 60 s.
- **Cuando** a los 30 s el usuario pulsa +15.
- **Entonces** el aviso llega a los 45 s restantes, no antes.
- **Y** si pulsa Saltar, no llega ningún aviso ni suena el pitido.
- *Automatizado:* `workout-timer.test.js › saltar el descanso no suena ni deja un aviso pendiente` y `al alargar el descanso, el aviso se reprograma con el tiempo nuevo`.
