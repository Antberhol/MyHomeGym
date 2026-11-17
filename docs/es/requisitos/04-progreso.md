# 4. Inicio, progreso, récords y mapa muscular

[← Índice de requisitos](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## Requisitos funcionales

| Id | Requisito | Prioridad |
| --- | --- | --- |
| FR-4.01 | Inicio muestra la rutina que toca hoy, o que ya se ha entrenado hoy, o que no hay rutina para hoy, con la acción correspondiente. | Must |
| FR-4.02 | Inicio muestra la mejor serie de la última sesión dibujada como una barra con sus discos reales. | Should |
| FR-4.03 | Inicio resume los últimos 7 días: entrenos, volumen, series, tiempo y racha. | Must |
| FR-4.04 | Inicio lista las últimas sesiones y los últimos récords, agrupados por ejercicio. | Must |
| FR-4.05 | La app registra automáticamente los récords personales al guardar cada entreno. | Must |
| FR-4.06 | Progreso → Resumen compara los entrenos de esta semana con la anterior y muestra el volumen por semana. | Must |
| FR-4.07 | Progreso → Fuerza muestra, por ejercicio, el mejor 1RM estimado, la última vez, el cambio y su curva. | Must |
| FR-4.08 | Progreso → Récords lista los récords filtrables por tipo. | Must |
| FR-4.09 | Progreso → Cuerpo muestra la evolución del peso y de los perímetros. | Should |
| FR-4.10 | El mapa muscular muestra una figura anatómica de frente y de espaldas con cada músculo coloreado según su volumen. | Must |
| FR-4.11 | El mapa se puede ver para 7, 30 o 90 días o para todo el historial. | Should |
| FR-4.12 | Al tocar un músculo del mapa se muestra su volumen en el periodo. | Should |
| FR-4.13 | Bajo el mapa se listan los músculos de más a menos trabajados, y aparte los no trabajados. | Should |
| FR-4.14 | Sin entrenos, Progreso muestra un estado vacío que invita a entrenar, sin gráficas vacías. | Must |

## Reglas de negocio

| Id | Regla |
| --- | --- |
| RN-4.01 | **Racha de días:** días naturales consecutivos con al menos un entreno, contando desde hoy o, si hoy aún no hay entreno, desde ayer. Si no hubo entreno ni hoy ni ayer, la racha es 0. |
| RN-4.02 | **Racha de semanas:** igual, por semanas de lunes a domingo. |
| RN-4.03 | Los "días" se cuentan como días naturales en la hora local, no como bloques de 24 horas. |
| RN-4.04 | **1RM estimado (Epley):** kilos × (1 + repeticiones / 30). Con 1 repetición, el 1RM es el propio peso. La curva usa la mejor serie de cada día. |
| RN-4.05 | **Récord de peso máximo:** se registra cuando la serie más pesada de la sesión supera el máximo anterior de ese ejercicio. Como mucho uno por ejercicio y sesión: una serie ascendente (60, 62,5 y 65 kg) cuenta como un solo récord, el de 65 kg. |
| RN-4.06 | **Récord de repeticiones con un mismo peso:** cuando la sesión hace más repeticiones que en cualquier serie de trabajo anterior con exactamente esos kilos. Como mucho uno por peso y sesión. La primera vez que se usa un peso no hay marca que batir y no cuenta como récord. |
| RN-4.07 | **Récord de mejor serie:** cuando el volumen (kilos × repeticiones) de la mejor serie de la sesión supera el mejor anterior de ese ejercicio. Como mucho uno por ejercicio y sesión. |
| RN-4.08 | **Récord de sesión:** cuando el volumen total de un entreno supera el de cualquier entreno anterior. Se guarda sin texto: su nombre lo pone la app en el idioma del usuario. |
| RN-4.09 | Las series de calentamiento nunca generan récords ni cuentan en volúmenes ni en el mapa muscular. |
| RN-4.10 | **Volumen por músculo:** el músculo principal de cada ejercicio suma el 100 % del volumen de la serie y cada secundario el 35 %. Un músculo que es principal y secundario a la vez solo cuenta como principal. |
| RN-4.11 | **Nivel del mapa:** de 1 a 4, relativo al músculo más trabajado del periodo (nivel = ⌈volumen / máximo × 4⌉). Un músculo con volumen 0 tiene nivel 0 y no se colorea. |
| RN-4.12 | El color del mapa es un único azul cuya intensidad sube con el nivel; la leyenda usa la misma escala. |
| RN-4.13 | Cada grupo dibujado en la figura corresponde a una zona de la app. Aductores y abductores no están dibujados, pero sí aparecen en las listas. |
| RN-4.14 | Volúmenes de 10.000 kg o más se muestran en toneladas. |
| RN-4.15 | **Corregir una sesión pasada recalcula los récords** de esa sesión y de todas las posteriores, en orden, como si cada una se acabase de guardar con las series ya corregidas (RN-4.05 a RN-4.09). Los récords de sesiones anteriores no cambian, y los de sesiones que ya no existen se conservan y cuentan como marca a batir. Las series, el volumen y los récords se guardan en una sola transacción: o se guarda todo o no cambia nada. |

## Pruebas de aceptación

### AC-4.1: Racha
- **Dado** que el usuario entrenó ayer y anteayer, y hoy aún no.
- **Entonces** Inicio muestra "2 días seguidos".
- **Y** si entrena hoy pasa a 3; si no entrena ni hoy ni mañana, pasado mañana es 0.
- *Automatizado:* `streaks-and-plates.test.js` (bloques "racha de días" y "racha de semanas", 7 casos) y `ui-rules.test.js › cuenta días naturales, no horas`.

### AC-4.2: Récords al guardar
- **Dado** que el récord de press de banca es 80 kg.
- **Cuando** guarda un entreno con una serie de calentamiento de 90 kg y una serie normal de 85 kg × 5.
- **Entonces** se registra un récord de peso máximo de 85 kg (no de 90) y el resumen lo cuenta.
- *Automatizado:* `prs.test.js › no cuenta las series de calentamiento`, `solo crea récord de peso si se supera el anterior` y `guarda peso máximo y volumen de serie con el detalle de la serie`.

### AC-4.3: 1RM estimado
- **Dado** una serie de 100 kg × 5.
- **Entonces** el 1RM estimado es 116,67 kg; con 100 kg × 1 es 100 kg.
- *Automatizado:* `calculations.test.js › estimateOneRmEpley`.

### AC-4.4: Mapa muscular tras un entreno de pecho
- **Dado** que el usuario completa un entreno de press de banca (pecho principal; tríceps y hombros secundarios).
- **Cuando** abre el Diagrama corporal.
- **Entonces** el pecho se ve en el azul más intenso, tríceps y hombros en un azul más suave, y el resto en gris.
- **Y** al tocar el pecho ve su volumen en kilos.
- *Automatizado:* `ui-rules.test.js › suma entero el principal, un 35 % los secundarios y nada de calentamiento`, `deja a 0 lo no trabajado y escala el resto respecto al máximo` y `body-figure.test.js` (los tres casos).

### AC-4.5: Cambio de periodo
- **Dado** un entreno de piernas hace 20 días y ninguno más.
- **Cuando** el usuario elige 7 días.
- **Entonces** la figura queda toda en gris y las piernas aparecen en "Sin trabajar".
- **Y** con 30 días las piernas aparecen coloreadas.
- *Manual.*

### AC-4.6: Progreso sin datos
- **Dado** un usuario sin entrenos.
- **Cuando** abre Progreso.
- **Entonces** ve un mensaje que le invita a entrenar y un botón para ir a Entrenar, sin gráficas vacías ni cifras a 0.
- *Manual.*

### AC-4.7: Volumen semanal
- **Dado** entrenos en las últimas semanas.
- **Entonces** la gráfica muestra una barra por semana, sin contar calentamientos, con la semana en curso destacada.
- *Manual.*

### AC-4.8: Un récord por tipo en cada sesión
- **Dado** un ejercicio con récord de 55 kg.
- **Cuando** el usuario hace en una sesión 60 × 5, 62,5 × 5 y 65 × 5.
- **Entonces** el resumen cuenta un récord de peso máximo (65 kg) y uno de mejor serie, no tres de cada.
- **Y** como nunca había usado esos pesos, no hay récord de repeticiones; si otro día hace 65 × 6, sí.
- *Automatizado:* `prs.test.js › una serie ascendente cuenta como un solo récord de peso: el mejor de la sesión`, `la primera vez que se usa un peso no es récord de repeticiones; la siguiente con más, sí` y `récord de sesión cuando el volumen total supera el de cualquier sesión anterior`. Verificado además con prueba de navegador (17/11/2026).

### AC-4.9: Corregir una errata en una sesión pasada
- **Dado** una sesión del día 10 con una sentadilla de 100 × 5 que en realidad fue de 60 × 5 (récord de 100 kg), y otra del día 12 con 65 × 5 que no batió nada por culpa de la errata.
- **Cuando** el usuario abre la sesión del día 10 desde Inicio, cambia 100 por 60 y guarda.
- **Entonces** el volumen de esa sesión pasa a 300 kg, el récord de peso del día 10 es 60 kg y la sesión del día 12 recupera su récord de 65 kg.
- **Y** si el guardado falla a medias, no cambia nada: ni la serie, ni el volumen, ni los récords.
- *Automatizado:* `session-correction.test.js › una errata de 100 kg deja de ser récord y la sesión posterior recupera el suyo`, `TrainingCorrectionApiTest.correctingASessionUpdatesSetsVolumeAndRecordsTogether` y `TrainingCorrectionApiTest.anInvalidCorrectionChangesNothing`. Verificado además con prueba de navegador (17/11/2026).
