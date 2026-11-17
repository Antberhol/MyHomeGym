# 2. Rutinas

[← Índice de requisitos](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## Requisitos funcionales

| Id | Requisito | Prioridad |
| --- | --- | --- |
| FR-2.01 | El usuario puede crear una rutina con nombre, días de la semana, color, descripción opcional y carpeta. | Must |
| FR-2.02 | El usuario puede editar todos esos datos y poner la rutina en pausa o reactivarla. | Must |
| FR-2.03 | El usuario puede borrar una rutina tras confirmarlo. | Must |
| FR-2.04 | El usuario puede añadir ejercicios a una rutina desde un buscador con fotos, eligiendo varios a la vez. | Must |
| FR-2.05 | Para cada ejercicio de la rutina se configuran series, repeticiones objetivo y descanso entre series. | Must |
| FR-2.06 | El usuario puede quitar un ejercicio de la rutina. | Must |
| FR-2.07 | El usuario puede reordenar los ejercicios arrastrando un asa. El orden nuevo se ve al momento; si no se puede guardar, se avisa y se vuelve al orden guardado. | Must |
| FR-2.08 | El usuario puede crear, renombrar y borrar carpetas para agrupar rutinas. | Should |
| FR-2.09 | La app ofrece plantillas listas (Full Body 3 días, Push Pull Legs, Upper Lower 4 días, Fuerza 5x5) que crean una rutina completa con un toque. | Should |
| FR-2.10 | Desde el detalle de una rutina se puede empezar a entrenarla directamente. | Must |
| FR-2.11 | Todas las plantillas se ven a la vez, sin tarjetas cortadas ni desplazamiento horizontal oculto. | Must |

## Reglas de negocio

| Id | Regla |
| --- | --- |
| RN-2.01 | Las repeticiones objetivo admiten un número (`5`) o un rango (`8-12`). |
| RN-2.02 | Los días se guardan normalizados (minúsculas, sin tildes); se aceptan días escritos a mano con tildes y mayúsculas. |
| RN-2.03 | Una rutina "toca hoy" si está activa y su lista de días incluye el día de la semana actual. |
| RN-2.04 | Las rutinas en pausa no se proponen en Inicio ni en Entrenar, pero se pueden seguir editando. |
| RN-2.05 | Borrar una rutina borra también su lista de ejercicios, en la misma transacción. Los entrenos ya hechos con ella se conservan. |
| RN-2.06 | Borrar una carpeta no borra sus rutinas: el servidor las deja en "Sin carpeta" en la misma transacción. |
| RN-2.07 | Un reordenamiento cambia el orden de todos los ejercicios afectados en una sola transacción. |
| RN-2.08 | El color de una rutina se elige entre los colores de disco; el texto encima se oscurece o aclara para que se lea. |
| RN-2.09 | Un campo opcional se puede vaciar: al guardar cambios, un campo sin valor se envía como `null` y el servidor lo vacía. Así una rutina se puede sacar de su carpeta ("Sin carpeta") y una descripción se puede borrar. Un campo obligatorio no se puede vaciar. |
| RN-2.10 | Un ejercicio de rutina tiene de 1 a 20 series y un descanso de 0 a 3.600 s; el servidor rechaza otros valores. |

## Pruebas de aceptación

### AC-2.1: Crear una rutina
- **Dado** que el usuario está en Rutinas.
- **Cuando** crea "Empuje" con lunes y jueves, color azul.
- **Entonces** aparece en la lista con sus días marcados y se abre su detalle para añadir ejercicios.
- *Manual.*

### AC-2.2: Añadir y configurar ejercicios
- **Dado** el detalle de "Empuje".
- **Cuando** añade "Press de banca" y "Fondos" en una sola selección, y pone al primero 4 series, `6-8` repeticiones y 120 s de descanso.
- **Entonces** los dos aparecen en la rutina en ese orden y el primero muestra 4 × 6-8, descanso 120 s.
- *Manual.*

### AC-2.3: Reordenar ejercicios
- **Dado** una rutina con al menos dos ejercicios.
- **Cuando** el usuario mantiene pulsada el asa del ejercicio B y lo suelta encima de A.
- **Entonces** el orden cambia en pantalla al momento, sin esperar al servidor.
- **Y** al recargar la página, el nuevo orden se mantiene.
- **Y** si el servidor no responde, aparece un aviso y la lista vuelve al orden guardado.
- *Manual. El aviso de fallo está verificado con prueba de navegador (17/11/2026).*

### AC-2.4: Borrar una rutina con historial
- **Dado** una rutina con la que ya se ha entrenado.
- **Cuando** el usuario la borra y confirma.
- **Entonces** la rutina y su lista de ejercicios desaparecen.
- **Y** los entrenos hechos con ella siguen en Inicio y en Progreso.
- *Manual. El borrado en cascada está en* `RoutineController.delete`.

### AC-2.5: Rutina de hoy
- **Dado** que hoy es jueves y "Empuje" está activa con jueves entre sus días.
- **Cuando** el usuario abre Inicio o Entrenar.
- **Entonces** ve "Hoy toca Empuje" con un botón para empezar.
- **Y** si la rutina está en pausa, no se propone.
- *Automatizado en parte:* `ui-rules.test.js › sabe si una rutina toca hoy` y `acepta días escritos a mano con tildes y mayúsculas`.

### AC-2.6: Plantillas
- **Dado** que el usuario está en Rutinas.
- **Cuando** pulsa "Usar" en Push Pull Legs.
- **Entonces** se crea una rutina con 9 ejercicios, cada uno con sus series, repeticiones y descanso, y sus días de la semana.
- **Y** las cuatro plantillas son visibles a la vez, tanto en el móvil como en escritorio.
- *Manual.*

### AC-2.7: Carpetas
- **Dado** una carpeta "Fuerza" con dos rutinas.
- **Cuando** el usuario borra la carpeta.
- **Entonces** las dos rutinas siguen existiendo, ahora en "Sin carpeta".
- *Automatizado:* `DataIntegrityApiTest.deletingAFolderKeepsItsRoutinesWithoutFolder`.

### AC-2.8: Sacar una rutina de su carpeta
- **Dado** una rutina dentro de la carpeta "Fuerza".
- **Cuando** el usuario la edita, elige "Sin carpeta" y guarda.
- **Entonces** la rutina aparece fuera de la carpeta, también tras recargar.
- **Y** si intenta dejar el nombre vacío, no se guarda.
- *Automatizado:* `DataIntegrityApiTest.patchingAFieldToNullClearsIt` y `backup-and-notes.test.js › un campo sin valor se envía como null para que el servidor lo vacíe`.

### AC-2.9: Valores no válidos en un ejercicio de rutina
- **Cuando** llega al servidor un ejercicio de rutina con 0 series, con 21 series o con un descanso negativo.
- **Entonces** se rechaza y no se guarda.
- *Automatizado:* `DataIntegrityApiTest.invalidValuesAreRejected`.
