# 1. Cuenta, sesión y perfil

[← Índice de requisitos](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## Requisitos funcionales

| Id | Requisito | Prioridad |
| --- | --- | --- |
| FR-1.01 | El usuario puede crear una cuenta con nombre de usuario y contraseña en el backend propio. | Must |
| FR-1.02 | El usuario puede iniciar sesión y recibe un token de acceso JWT. | Must |
| FR-1.03 | La sesión se mantiene entre recargas y cierres del navegador durante 30 días sin volver a pedir la contraseña. | Must |
| FR-1.04 | El usuario puede cerrar sesión desde el menú de cuenta. | Must |
| FR-1.05 | La primera vez que entra, el usuario pasa por un asistente que pide nombre (opcional), peso y altura, y puede añadir cintura, pecho y pierna. | Must |
| FR-1.06 | El asistente calcula y muestra el IMC y su categoría antes de terminar. | Should |
| FR-1.07 | El usuario puede editar su nombre, peso y altura en Perfil; el IMC se recalcula. | Must |
| FR-1.08 | El usuario puede registrar mediciones con fecha: peso y, opcionalmente, cintura, pecho, hombros, bíceps, pierna y gemelo. | Must |
| FR-1.09 | El usuario puede borrar una medición. | Should |

## Reglas de negocio

| Id | Regla |
| --- | --- |
| RN-1.01 | Nombre de usuario: de 3 a 40 caracteres, solo letras, números, punto, guion y guion bajo. Único en el sistema. |
| RN-1.02 | Contraseña: de 8 a 128 caracteres. Se guarda solo su hash (BCrypt). |
| RN-1.03 | Tras 5 intentos fallidos seguidos, el inicio de sesión de esa cuenta se bloquea 15 minutos. |
| RN-1.04 | El error de acceso es el mismo tanto si el usuario no existe como si la contraseña es incorrecta, y tarda lo mismo. |
| RN-1.05 | El token de acceso caduca a los 15 minutos y solo se guarda en memoria, nunca en `localStorage`. |
| RN-1.06 | El token de refresco viaja en una cookie HttpOnly, caduca a los 30 días y se sustituye por uno nuevo en cada uso. |
| RN-1.07 | Si se presenta un token de refresco ya usado, se revocan todas las sesiones activas de ese usuario. |
| RN-1.08 | El propietario de cualquier dato se toma siempre del JWT, nunca del cuerpo de la petición. Un dato ajeno se comporta como inexistente. |
| RN-1.09 | IMC = peso (kg) / altura (m)². Categorías: bajo peso (< 18,5), normal (< 25), sobrepeso (< 30) y obesidad (≥ 30). |
| RN-1.10 | Los perímetros de una medición son opcionales; el peso es obligatorio. |

## Pruebas de aceptación

### AC-1.1: Registro con datos válidos e inválidos
- **Dado** que no existe el usuario `antonio`.
- **Cuando** se registra con `antonio` y una contraseña de 8 caracteres o más.
- **Entonces** la cuenta se crea y entra en la app.
- **Y** si alguien intenta registrar otra vez `antonio`, o usa una contraseña de 7 caracteres, el registro se rechaza con un mensaje claro.
- *Automatizado:* `ApiIntegrationTest.registerRejectsDuplicatesAndWeakPasswords`.

### AC-1.2: Bloqueo por intentos fallidos
- **Dado** un usuario registrado.
- **Cuando** falla la contraseña 5 veces seguidas.
- **Entonces** el sexto intento, aunque la contraseña sea correcta, se rechaza durante 15 minutos.
- *Automatizado:* `ApiIntegrationTest.loginFailsWithWrongPasswordAndLocksAfterRepeatedFailures`.

### AC-1.3: Sesión persistente y rotación del refresco
- **Dado** un usuario con sesión iniciada.
- **Cuando** recarga la página o vuelve antes de 30 días.
- **Entonces** sigue dentro sin escribir la contraseña.
- **Y** cada renovación entrega un token de refresco nuevo; si se reutiliza el anterior, se cierran todas sus sesiones.
- *Automatizado:* `ApiIntegrationTest.refreshTokenRotatesAndReuseRevokesSession` y `api.test.js › renueva la sesión ante un 401 y repite la petición con el token nuevo`.

### AC-1.4: Sesión caducada
- **Dado** que el token de refresco ya no es válido.
- **Cuando** la app hace una petición y recibe 401.
- **Entonces** avisa de que la sesión ha caducado y vuelve a la pantalla de acceso.
- *Automatizado:* `api.test.js › avisa de sesión caducada si no se puede renovar`.

### AC-1.5: Endpoints protegidos
- **Cuando** se llama a cualquier endpoint de datos sin token.
- **Entonces** la respuesta es 401. El catálogo y `/api/health` son públicos.
- *Automatizado:* `ApiIntegrationTest.protectedEndpointsRequireToken`.

### AC-1.6: Aislamiento entre usuarios
- **Dado** que la usuaria A ha creado una rutina.
- **Cuando** el usuario B la pide, la modifica o la borra por su id, o intenta crear otra con ese mismo id.
- **Entonces** el backend responde como si no existiera y la rutina de A no cambia.
- *Automatizado:* `ApiIntegrationTest.usersCannotSeeOrOverwriteEachOthersData`.

### AC-1.7: Asistente inicial
- **Dado** un usuario recién registrado.
- **Cuando** introduce 78 kg y 178 cm y avanza.
- **Entonces** ve un IMC de 24,6 ("normal") y, al pulsar Empezar, llega a Inicio con el perfil guardado.
- **Y** el perfil no se guarda hasta que pulsa Empezar en el último paso: pulsar Siguiente nunca lo envía antes de enseñar el IMC.
- *La fórmula está automatizada en* `calculations.test.js › calculateImc` *y* `classifyImc`*. El recorrido completo, verificado con prueba de navegador (17/11/2026).*

### AC-1.8: Mediciones
- **Dado** un usuario en Perfil.
- **Cuando** añade una medición solo con el peso, y otra con peso y cintura.
- **Entonces** ambas se guardan con su fecha y aparecen en Progreso → Cuerpo.
- **Y** si añade una medición sin peso, la app lo marca como error y no la guarda.
- *Manual.*

### AC-1.9: Cerrar sesión
- **Cuando** el usuario pulsa Cerrar sesión en el menú de cuenta.
- **Entonces** vuelve a la pantalla de acceso, y recargar la página no recupera la sesión.
- *Manual.*
