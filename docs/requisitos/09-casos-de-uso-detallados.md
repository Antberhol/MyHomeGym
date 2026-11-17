# 9. Casos de uso detallados

[← Índice de la ERS](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md) · [Catálogo de casos de uso](08-actores-y-casos-de-uso.md)

Plantilla de Durán y Bernárdez, en forma compacta. "El sistema" es MyHomeGym (frontend + backend).

---

## CU-02 Iniciar sesión

| Campo | Valor |
| --- | --- |
| Actor | ACT-01 Visitante |
| Objetivos | OBJ-01, OBJ-07 |
| Requisitos | FR-1.02, FR-1.03, RN-1.03 a RN-1.07 |
| Precondición | El visitante tiene una cuenta y no tiene sesión iniciada en este navegador. |
| Postcondición | El usuario está dentro de la app; tiene un token de acceso en memoria y un token de refresco en una cookie HttpOnly. |
| Importancia / urgencia | Vital / inmediata |
| Rendimiento | La respuesta llega en menos de 1 s en la red local (RNF-5.04). |

**Secuencia normal**

1. El visitante escribe su usuario y contraseña y pulsa "Entrar".
2. El sistema comprueba que la cuenta no está bloqueada (RN-1.03).
3. El sistema comprueba la contraseña contra su hash.
4. El sistema emite un token de acceso (15 min) y un token de refresco (30 días, de un solo uso).
5. El sistema muestra Inicio o, si no hay perfil, el asistente inicial (CU-04).

**Excepciones**

- **E1 (paso 2), cuenta bloqueada:** el sistema avisa de que ha habido demasiados intentos y de que hay que esperar 15 minutos, y no comprueba la contraseña. El bloqueo va por nombre de usuario, exista o no, así que no revela qué cuentas existen.
- **E2 (paso 3), credenciales incorrectas:** el sistema muestra un error genérico, suma un intento fallido y, al quinto seguido, bloquea la cuenta 15 minutos.
- **E3, servidor apagado:** el sistema explica que el servidor no responde (AC-6.8).

---

## CU-06 + CU-07 Crear una rutina y configurar sus ejercicios

| Campo | Valor |
| --- | --- |
| Actor | ACT-02 Usuario |
| Objetivos | OBJ-02 |
| Requisitos | FR-2.01 a FR-2.07, RN-2.01 a RN-2.08, RI-04, RI-05 |
| Precondición | El usuario tiene sesión iniciada. |
| Postcondición | Existe una rutina con sus ejercicios en orden, cada uno con series, repeticiones objetivo y descanso. |
| Frecuencia | Semanal o mensual |

**Secuencia normal**

1. El usuario pulsa "Nueva rutina" en Rutinas.
2. El sistema muestra el formulario: nombre, días (se tocan), color, descripción y carpeta.
3. El usuario rellena al menos el nombre y guarda.
4. El sistema crea la rutina activa y abre su detalle.
5. El usuario pulsa "Añadir ejercicios", busca y marca uno o varios, y confirma.
6. El sistema los añade al final, con 3 series de `8-12` y 90 s de descanso por defecto.
7. El usuario toca un ejercicio y ajusta series (1 a 12), repeticiones (número o rango) y descanso (60 a 240 s).
8. El usuario arrastra los ejercicios por su asa para cambiar el orden.
9. El sistema guarda el nuevo orden de todos los ejercicios en una sola transacción.

**Excepciones**

- **E1 (paso 3), sin nombre:** el sistema marca el campo y no guarda.
- **E2 (paso 9), fallo al guardar el orden:** el sistema muestra un aviso con el motivo y la lista vuelve al último orden guardado.

---

## CU-10 Realizar un entreno guiado

| Campo | Valor |
| --- | --- |
| Actor | ACT-02 Usuario; ACT-03 Reloj (descansos) |
| Objetivos | OBJ-03, OBJ-04 |
| Requisitos | FR-3.01, FR-3.03 a FR-3.11, FR-3.13 a FR-3.18, RN-3.01 a RN-3.09, RN-4.05 a RN-4.09 |
| Precondición | El usuario tiene al menos una rutina activa con ejercicios. |
| Postcondición | Queda guardado un entreno con todas sus series; los récords nuevos están registrados; el entreno en curso se ha borrado del navegador. |
| Frecuencia | De 3 a 6 veces por semana. **Es el caso de uso más crítico.** |
| Rendimiento | Marcar una serie responde en menos de 100 ms, sin esperar al servidor (RNF-5.01). |

**Secuencia normal**

1. El usuario pulsa "Empezar" en la rutina de hoy (Inicio o Entrenar) o en otra rutina.
2. El sistema arranca el cronómetro y muestra el primer ejercicio: fotos, objetivo (series × repeticiones, descanso) y una fila por serie con lo que hizo la última vez y los campos precargados con esos valores.
3. Si toca subir peso (RN-3.01), el sistema muestra la sugerencia; el usuario puede aplicarla con un toque.
4. El usuario corrige kilos y repeticiones si hace falta y marca la serie como hecha.
5. El sistema arranca la cuenta atrás del descanso de ese ejercicio.
6. Al acabar el descanso, el sistema hace sonar un pitido doble, vibra y, si el aviso está activado y la app está en segundo plano, envía una notificación.
7. Se repiten los pasos 4 a 6 con cada serie, y el usuario pasa al siguiente ejercicio.
8. El usuario pulsa "Terminar".
9. El sistema guarda el entreno y sus series en una sola operación, calcula el volumen sin calentamientos y registra los récords batidos.
10. El sistema muestra el resumen y la vista previa para compartir.

**Secuencias alternativas y excepciones**

- **A1 (pasos 4 a 7), opciones de la serie:** el usuario cambia el tipo (calentamiento, drop set, al fallo) o el RPE (de 6 a 10).
- **A2, pausa:** el usuario pausa el cronómetro desde el menú; el tiempo en pausa no cuenta en la duración.
- **A3, ajustar el descanso:** ±15 s o saltarlo.
- **A4, calculadora de discos:** el usuario la abre desde el menú y vuelve al entreno sin perder nada.
- **E1, la pestaña se cierra o se recarga:** al volver, el sistema recupera el entreno tal como estaba (ejercicio, series marcadas, valores y cronómetro).
- **E2 (paso 8), descartar:** el usuario descarta desde el menú; tras confirmar, el sistema borra el entreno en curso sin guardar nada.
- **E3 (paso 9), fallo al guardar:** no queda guardado un entreno a medias. El sistema avisa de que no se ha podido guardar, reanuda el cronómetro y mantiene el entreno abierto para reintentarlo (AC-3.9).
- **E4 (paso 9), series vacías:** las series con 0 repeticiones no se guardan.

---

## CU-11 Realizar un entreno libre

Igual que CU-10, con estas diferencias:

1. El usuario elige "Entreno libre" y el sistema muestra un entreno vacío.
2. El usuario pulsa "Añadir ejercicio", lo busca y lo elige.
3. El sistema lo añade con las series de la última vez rellenas o, si nunca lo ha hecho, con 3 series vacías (FR-3.12).
4. El usuario puede añadir y quitar series y ejercicios; un ejercicio nunca se queda sin series.

No hay sugerencia de peso, porque no hay repeticiones objetivo.

---

## CU-14 Consultar el mapa muscular

| Campo | Valor |
| --- | --- |
| Actor | ACT-02 Usuario |
| Objetivos | OBJ-05 |
| Requisitos | FR-4.10 a FR-4.13, RN-4.09 a RN-4.13 |
| Precondición | El usuario tiene sesión iniciada. |
| Postcondición | Ninguna (solo consulta). |

**Secuencia normal**

1. El usuario abre el Diagrama corporal (o Progreso → Resumen).
2. El sistema calcula el volumen de cada músculo en los últimos 30 días: el principal suma el 100 % y los secundarios el 35 %, sin calentamientos.
3. El sistema colorea la figura de frente y de espaldas en cuatro niveles relativos al músculo más trabajado.
4. El usuario cambia el periodo (7, 30, 90 días o todo) y el sistema recalcula.
5. El usuario toca un músculo y el sistema muestra su volumen.

**Excepciones**

- **E1, sin entrenos en el periodo:** la figura queda en gris y todos los músculos aparecen en "Sin trabajar".

---

## CU-19 Restaurar una copia

| Campo | Valor |
| --- | --- |
| Actor | ACT-02 Usuario |
| Objetivos | OBJ-07 |
| Requisitos | FR-6.03, RN-6.01 a RN-6.03 |
| Precondición | El usuario tiene un fichero JSON exportado por MyHomeGym. |
| Postcondición | La cuenta contiene la unión de sus datos y los de la copia; nada de lo que ya tenía se ha borrado. |

**Secuencia normal**

1. El usuario pulsa "Restaurar una copia" en Configuración y elige el fichero.
2. La app comprueba que el fichero es una copia de MyHomeGym y lo envía al servidor.
3. El servidor, en una sola transacción, sustituye el perfil por el de la copia y, para cada tipo de dato, valida y añade los registros cuyo id no existe y salta los que ya existen.
4. Si algún registro no es válido, el servidor no añade ninguno y el sistema avisa.
5. El sistema informa de cuántos registros ha añadido y cuántos ya existían.

**Excepciones**

- **E1 (paso 2), el fichero no es una copia:** el sistema avisa y no envía nada al servidor.

---

## CU-20 Borrar todos mis datos

| Campo | Valor |
| --- | --- |
| Actor | ACT-02 Usuario |
| Objetivos | OBJ-07 |
| Requisitos | FR-6.06, RN-6.05 |
| Precondición | El usuario tiene sesión iniciada. |
| Postcondición | La cuenta sigue existiendo, pero sin perfil, rutinas, carpetas, entrenos, series, mediciones, récords, notas, ejercicios propios ni ajustes de avisos. |

**Secuencia normal**

1. El usuario pulsa "Borrar todos mis datos".
2. El sistema pide confirmación explicando que no se puede deshacer.
3. El usuario confirma.
4. El sistema borra los datos y vuelve al asistente inicial.

**Excepciones**

- **E1 (paso 3), cancelar:** no se borra nada.
