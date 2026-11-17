# Cómo contribuir a MyHomeGym

Gracias por querer mejorar el proyecto. Estas reglas existen para que cualquier cambio sea fácil de revisar.

## Antes de abrir un pull request

1. Abre una issue si el cambio es grande o cambia el comportamiento, para hablarlo antes de programar.
2. Un pull request = un cambio. Mejor varios pequeños que uno enorme.
3. Comprueba que todo pasa en local:

```bash
cd backend && ./mvnw verify
cd frontend && npm run lint && npm test && npm run check:i18n && npm run build
```

La CI ejecuta exactamente lo mismo y no se fusiona nada en rojo.

## Reglas del código

### Frontend (JavaScript)

- Las pantallas no llaman a `fetch`: usan hooks y repositorios, que usan `src/lib/db.js`, que usa `src/lib/api.js`.
- Todo texto visible va en `src/locales/es.json` y `src/locales/en.json` con las mismas claves.
- Colores y tipografías solo con los tokens de `tailwind.config.js` (`gym-*`, `plate-*`, `font-display`). Nada de colores sueltos.
- El violeta (`gym-accent`) es solo para acciones; `gym-danger`, para errores y borrar; los colores de disco (`plate-*`), solo para datos. La paleta está en `src/styles/theme.css`.
- Un fichero de más de unas 300 líneas se divide.

### Backend (Java)

- Un recurso nuevo de usuario extiende `OwnedEntity` y `OwnedCrudController`: así hereda la regla de que nadie toca datos ajenos.
- Nunca se confía en el `ownerId` que mande el cliente: sale siempre del JWT.
- Cada endpoint nuevo lleva su test en `src/test` (MockMvc).
- Errores con `ResponseStatusException` o `NotFoundException`: usa `ApiException` cuando la app deba traducir el mensaje. El cliente recibe `{"error": "mensaje", "code": "CODIGO"}`.

## Mejorar las traducciones

- **Nombres de ejercicios**: busca el `id` del ejercicio en `backend/src/main/resources/catalog/exercises/` (un fichero por músculo principal, un ejercicio por línea) y cambia su `nameEs`. Es la contribución más fácil y más útil. Un test comprueba que cada ejercicio siga en una sola línea y en el fichero de su músculo.
- **Músculos, material y niveles**: `backend/src/main/java/com/myhomegym/catalog/CatalogVocabulary.java`.
- **Textos de la interfaz**: `frontend/src/locales/*.json`.

## Documentación y requisitos

- Una funcionalidad o regla nueva se apunta en su módulo de `docs/requisitos/` con su `FR`, su `RN` si tiene cálculo o condición, y al menos una prueba de aceptación `AC`.
- Si la prueba está automatizada, cita el test y añádelo a la matriz de `docs/requisitos/13-trazabilidad.md`.
- Si cambia lo que ve el usuario, actualiza también `docs/FUNCIONALIDAD.md`.

## Licencia de las contribuciones

MyHomeGym se distribuye bajo GPL-3.0-or-later. Al enviar un pull request aceptas que tu contribución se publique bajo esa misma licencia y declaras que el código es tuyo o que tienes derecho a aportarlo. Las dependencias nuevas deben tener una licencia compatible (MIT, BSD, Apache-2.0, MPL-2.0, OFL o similar); si añades una, apúntala en `NOTICE`.

## Commits

Mensajes cortos en imperativo que digan qué cambia y por qué, por ejemplo `Corrige el cálculo del 1RM con 0 repeticiones`.
