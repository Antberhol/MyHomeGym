# Funcionalidad de MyHomeGym

[English](../en/USER_GUIDE.md) · **Español**

Qué hace la aplicación, pantalla por pantalla, y con qué reglas. Está pensado para quien vaya a usarla, probarla o cambiarla. Los requisitos formales y sus pruebas de aceptación están en [REQUISITOS_FUNCIONALES_Y_ACEPTACION.md](REQUISITOS_FUNCIONALES_Y_ACEPTACION.md). Cómo está construida, en [ARCHITECTURE.md](ARCHITECTURE.md).

## Qué es

Una aplicación para registrar entrenamientos de fuerza en un gimnasio en casa. Planificas tus rutinas, las sigues serie a serie con el móvil en la mano, y la app te dice cuándo subir peso, qué récords has batido y qué músculos llevas más o menos trabajados.

Todo funciona en tu propio servidor: el backend guarda los datos en una base de datos H2, en un fichero dentro de `backend/data/`. No hay ninguna nube de terceros. Lo único que sale a Internet son las fotos del catálogo (desde GitHub) y la traducción automática de las instrucciones (desactivable).

## Mapa de pantallas

| Pantalla | Ruta | Para qué |
| --- | --- | --- |
| Acceso | (sin sesión) | Crear cuenta o entrar |
| Asistente inicial | (primera vez) | Peso, altura y medidas para calcular el IMC |
| Inicio | `/` | Qué toca hoy y cómo va la semana |
| Entrenar | `/entrenar` | Elegir rutina o entreno libre, y registrarlo |
| Rutinas | `/rutinas` | Tus rutinas, carpetas y plantillas |
| Detalle de rutina | `/rutinas/:id` | Ejercicios, orden, series y descansos de una rutina |
| Catálogo | `/catalogo` | Los 876 ejercicios y los tuyos propios |
| Ficha de ejercicio | `/catalogo/:id` | Fotos, músculos, instrucciones e historial |
| Progreso | `/progreso` | Resumen, fuerza, récords y medidas del cuerpo |
| Diagrama corporal | `/diagrama-corporal` | Músculos trabajados por periodo |
| Perfil | `/perfil` | Tus datos y mediciones |
| Configuración | `/configuracion` | Idioma, avisos, copias de seguridad y borrado |

En el móvil la navegación es una barra inferior con Inicio, Rutinas, Entrenar (botón central), Catálogo y Progreso. Perfil y Configuración están en el menú de cuenta (la inicial de tu nombre, arriba a la derecha). En pantallas anchas aparece una barra lateral con todas las secciones, que se puede plegar.

## Cuenta y sesión

- **Registro:** usuario de 3 a 40 caracteres (letras, números, punto, guion y guion bajo) y contraseña de 8 a 128. No puede haber dos usuarios con el mismo nombre.
- **Entrada:** con 5 intentos fallidos seguidos la cuenta queda bloqueada 15 minutos, y la app lo dice. Con una contraseña incorrecta, el mensaje no dice si falló el usuario o la contraseña.
- **Sesión:** el token de acceso (JWT) dura 15 minutos y vive solo en memoria. Para no pedirte la contraseña cada vez, hay un token de refresco en una cookie HttpOnly que dura 30 días y cambia en cada uso. Si alguien reutiliza un token de refresco ya usado, se cierran todas las sesiones de ese usuario.
- **Aislamiento:** el servidor saca tu identidad del token, nunca de lo que envía el navegador. Si pides o tocas un dato de otra persona, la respuesta es la misma que si no existiera.
- **Cerrar sesión:** desde el menú de cuenta. Borra la cookie y revoca el token de refresco.

## Asistente inicial

La primera vez que entras, la app te pide en tres pasos nombre (opcional), peso corporal y altura; después cintura, pecho y pierna (opcionales), y por último te enseña tu IMC y su categoría. El perfil se guarda al pulsar **Empezar** en ese último paso. Todo se puede cambiar después en Perfil.

## Inicio

1. **Hoy toca:** si tienes una rutina activa programada para hoy, la propone con un botón para empezarla. Si ya has entrenado hoy, lo dice y te ofrece otra sesión. Si no hay rutina para hoy, ofrece un entreno libre.
2. **Tu mejor serie de la última sesión:** una barra cargada con los discos reales de esa serie (por lado), con el peso, el ejercicio y las repeticiones.
3. **Últimos 7 días:** entrenos, volumen, series, tiempo y racha.
4. **Últimas sesiones:** al tocar una se abre su ficha, donde puedes corregir pesos y repeticiones, o copiarla como texto (para WhatsApp) o en CSV. Al guardar una corrección se recalculan el volumen de la sesión y los récords de esa sesión y de las siguientes: si un día apuntaste 100 kg por error, ese récord desaparece y el de la sesión siguiente vuelve a contar. Se guarda todo junto o nada.
5. **Tus récords:** los últimos récords, agrupados por ejercicio.

**Racha:** días seguidos con al menos un entreno, contando desde hoy o desde ayer (si hoy aún no has entrenado, la racha sigue viva). También se calcula la racha en semanas (semanas de lunes a domingo).

## Rutinas

- **Crear y editar:** nombre, días de la semana (se tocan), color, descripción opcional, carpeta y si está activa o en pausa. Las rutinas en pausa no se proponen para entrenar.
- **Borrar:** pide confirmación. Se borra la rutina con su lista de ejercicios en una sola operación. Los entrenos que ya hiciste con ella se conservan.
- **Carpetas:** para agrupar rutinas. Una rutina se mueve de carpeta, o se saca a "Sin carpeta", al editarla. Si borras una carpeta, sus rutinas no se borran: pasan a "Sin carpeta".
- **Plantillas de inicio:** Full Body 3 días, Push Pull Legs, Upper Lower 4 días y Fuerza 5x5. Con un toque crean una rutina con sus ejercicios, series, repeticiones y descansos.
- **Detalle de rutina:** lista de ejercicios. Desde aquí se añaden (buscador con fotos, selección múltiple), se quitan y se reordenan arrastrando el asa de la izquierda. El nuevo orden se ve al momento y se guarda de una vez; si no se puede guardar, la app avisa y vuelve al orden anterior. Al tocar un ejercicio se ajustan sus series, sus repeticiones objetivo (un número, como 5, o un rango, como 8-12) y el descanso entre series.

## Entrenar

### Elegir

La pantalla muestra primero la rutina de hoy, luego el resto de tus rutinas activas y, al final, el entreno libre. Desde el detalle de una rutina también puedes empezarla directamente.

### Entreno guiado (con rutina)

- Un ejercicio cada vez, con su objetivo (series × repeticiones y descanso), la lista de ejercicios de la rutina y cuál viene después.
- **Tabla de series:** para cada serie, lo que hiciste la última vez, los kilos y las repeticiones de hoy, y un botón para marcarla como hecha. Al marcarla arranca el descanso.
- **Opciones de la serie:** tipo (normal, calentamiento, drop set o al fallo), esfuerzo RPE (de 6 a 10, en medios puntos), o quitarla. También se pueden añadir series.
- **Sugerencia de peso (doble progresión):** si la última vez completaste el máximo de repeticiones del rango (o el número fijo, como en un 5x5) en todas las series de trabajo, la app propone subir 2,5 kg y lo aplica con un toque. Los calentamientos no cuentan para esta regla ni suben de peso.
- **Notas** por ejercicio para esa sesión.

### Entreno libre

Añades ejercicios con el buscador según vas entrenando. Si ya hiciste ese ejercicio antes, llega con las series de la última vez rellenas. Por lo demás funciona igual que el guiado.

### Durante el entreno

- **Cabecera fija** con el cronómetro, el botón Terminar y un menú con pausar o reanudar, la calculadora de discos y descartar el entreno.
- **El reloj no se pierde:** el cronómetro y el descanso se calculan con la hora real. Si bloqueas el móvil o cambias de app, al volver marcan lo correcto.
- **Descanso:** barra con cuenta atrás, ±15 segundos y botón para saltarlo. Al terminar suena un pitido doble y el móvil vibra (si lo permite). Si tienes activado el aviso de fin de descanso y la app está en segundo plano, llega una notificación a la hora exacta: si alargas o acortas el descanso, el aviso se mueve con él, y si lo saltas, se cancela sin sonar.
- **Calculadora de discos:** con el peso objetivo y la barra (20 kg por defecto), dice qué discos poner en cada lado con los de 25, 20, 15, 10, 5, 2,5 y 1,25 kg, y lo dibuja. Si no se puede exacto, da el peso más cercano.
- **Recuperación:** el entreno en curso se guarda en el navegador a cada cambio. Si cierras la pestaña o se recarga, al volver sigue donde lo dejaste.

### Terminar

- El entreno y todas sus series se guardan juntos en una sola operación: o se guarda todo o nada.
- La duración sale del cronómetro (sin pausas), salvo que la cambies a mano.
- Las series con 0 repeticiones no se guardan. Las de 0 kg sí (ejercicios con el peso del cuerpo).
- Si el servidor no responde al terminar, la app avisa y el entreno sigue abierto, con el cronómetro en marcha, para volver a pulsar Terminar.
- El **resumen** muestra duración, volumen, series, el desglose por ejercicio, tus notas y los récords batidos. Desde ahí puedes compartir una imagen de la sesión.

## Volumen, 1RM y récords

- **Volumen de una serie** = kilos × repeticiones. Las series de calentamiento nunca cuentan en volúmenes, récords ni mapa muscular.
- **1RM estimado** con la fórmula de Epley: kilos × (1 + repeticiones / 30). Con una sola repetición, el 1RM es el propio peso.
- **Récords personales**, que se comprueban al terminar cada entreno. Como mucho uno por tipo y ejercicio en cada sesión: si subes 60, 62,5 y 65 kg, cuenta un récord (65 kg), no tres.
  - *Peso máximo:* lo más pesado que has levantado en un ejercicio.
  - *Repeticiones con un mismo peso:* más repeticiones que nunca con esos kilos. La primera vez que usas un peso no cuenta: no hay marca que batir.
  - *Mejor serie:* la serie con más volumen en ese ejercicio.
  - *Sesión:* el entreno con más volumen total.

## Catálogo

- **876 ejercicios** de free-exercise-db (dominio público), con dos fotos cada uno (posición inicial y final). En el servidor están en `backend/src/main/resources/catalog/exercises/`, un fichero por músculo principal y un ejercicio por línea.
- **Nombres** traducidos a mano. Músculos, material, nivel y categoría usan un vocabulario fijo traducido.
- **Instrucciones:** se traducen automáticamente la primera vez que alguien abre la ficha y se guardan para siempre. Te tratan siempre de tú, como el resto de la app, aunque el traductor mezcle "tú" y "usted". Si el traductor falla, salen en inglés con un aviso.
- **Buscar y filtrar:** por texto (en español o en el nombre original), por grupo muscular, por material y por nivel, o ver solo los tuyos. La rejilla carga de 40 en 40.
- **Ejercicios propios:** nombre, grupo muscular, material e instrucciones (un paso por línea). Se pueden editar y borrar. Al borrar uno, se quita de las rutinas que lo usaban y se borra su nota; las series que ya hiciste con él se conservan en tu historial.
- **Ficha:** fotos que se alternan como animación, músculos principales y secundarios, nivel, mecánica, tipo de fuerza, cómo se hace, tu historial (peso máximo, 1RM, sesiones recientes, gráfica) y una nota personal, que se guarda en el servidor y entra en la copia de seguridad. Las notas que antes vivían solo en el navegador se suben solas la primera vez que abres una ficha.

## Progreso

- **Resumen:** entrenos de esta semana comparados con la anterior, volumen semanal (la semana en curso en otro color) y el mapa muscular de los últimos 30 días.
- **Fuerza:** para cada ejercicio, el mejor 1RM, la última vez, el cambio y la curva del 1RM estimado (mejor serie de cada día).
- **Récords:** filtrables por tipo, con fecha y detalle.
- **Cuerpo:** evolución del peso corporal y de los perímetros.

## Mapa muscular (Diagrama corporal)

- Una figura anatómica de frente y de espaldas. Cada músculo se colorea según el volumen que le has dado en el periodo (7, 30 o 90 días, o todo).
- El músculo principal de cada ejercicio cuenta el 100 % del volumen y los secundarios el 35 %.
- El color es relativo a tu músculo más trabajado, en cuatro niveles. Los músculos sin trabajar se quedan en gris.
- Al tocar un músculo, la app dice su volumen. Debajo hay una lista ordenada de más a menos trabajado, y otra de los que no has trabajado en el periodo.
- Aductores y abductores no están dibujados en la figura, pero sí aparecen en las listas.

## Perfil

Nombre, peso, altura e IMC. **Mediciones** con fecha: peso y, opcionalmente, cintura, pecho, hombros, bíceps, pierna y gemelo. Se pueden añadir y borrar. La evolución se ve en Progreso, pestaña Cuerpo.

## Configuración

- **Idioma:** español o inglés. El cambio es inmediato y se recuerda. Todo sale en el idioma elegido: pantallas, avisos, mensajes de error, el PDF y el texto de una sesión copiada.
- **Avisos** (necesitan permiso del navegador):
  - *Aviso de racha:* si llevas 3 o más días seguidos y hoy no has entrenado, te avisa a la hora que elijas (19:00 por defecto; viene activado). Si entrenas antes de esa hora, no avisa. Como mucho una vez al día.
  - *Fin del descanso.*
  - *Enviar prueba.*
- **Tus datos:**
  - *Copia completa en JSON* (perfil, ejercicios propios, rutinas, carpetas, entrenos, series, mediciones, récords y notas de ejercicio).
  - *Restaurar una copia:* añade lo que falte sin borrar lo que ya tienes; el perfil se sustituye por el de la copia. Se hace de una vez en el servidor: si la copia trae algún dato no válido, no se añade nada. Al acabar dice cuántos registros ha añadido y cuántos ya tenías.
  - *Entrenos en CSV* (exportar e importar) para Excel o Google Sheets, con los acentos correctos y las notas de varias líneas.
  - *Resumen en PDF* para imprimir, en el idioma de la app.
- **Borrar todos mis datos:** con confirmación. Borra todo excepto la cuenta.

## Cuando algo falla

- Los mensajes de error salen en tu idioma y sin tecnicismos ("Ese nombre de usuario ya existe", "El servidor no responde").
- Si un cambio no se puede guardar, aparece un aviso arriba durante unos segundos. Ningún fallo de guardado pasa en silencio.
- Si falla al terminar un entreno, el entreno sigue abierto para volver a intentarlo.
- Si una pantalla da un error inesperado, se muestra un aviso con dos opciones: reintentar, o borrar la caché y recargar. Borrar la caché conserva el idioma y el entreno en curso; si tienes uno a medias, la pantalla lo dice y te deja descartarlo aparte, por si el error viene de él.

## Instalación como app

Es una PWA: se puede instalar en el móvil o en el escritorio desde el navegador. La interfaz se guarda en caché, pero las llamadas al servidor nunca, así que para usarla hace falta que el backend esté encendido y accesible. Cuando hay una versión nueva, un aviso propone recargar.

## Limitaciones conocidas

- Las **fotos del catálogo** se cargan desde Internet (GitHub); sin conexión se ve un icono en su lugar. El resto de la app no carga nada de terceros: las tipografías van dentro.
- No hay modo claro: la app es solo oscura.
