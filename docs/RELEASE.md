# Cómo publicar una versión

Guía para el mantenedor. Una versión es una etiqueta de git (`v1.0.0-beta.1`) más una release de GitHub con el `.jar` listo para ejecutar. El flujo `.github/workflows/release.yml` hace casi todo: tú decides el número, escribes las notas y subes la etiqueta.

## Qué número poner

MyHomeGym sigue [Versionado Semántico](https://semver.org/lang/es/): `MAYOR.MENOR.PARCHE`.

| Cambio | Ejemplo |
| --- | --- |
| Solo correcciones | `1.0.0` → `1.0.1` |
| Funcionalidad nueva compatible con los datos anteriores | `1.0.1` → `1.1.0` |
| Algo que obliga a exportar e importar los datos, o cambia la API | `1.1.0` → `2.0.0` |

Mientras la app esté en beta, cada versión nueva es `1.0.0-beta.2`, `1.0.0-beta.3`… GitHub las marca como *pre-release*. Cuando no queden fallos graves abiertos, publica `1.0.0-rc.1` (candidata) y, si en una o dos semanas nadie encuentra nada, `1.0.0`.

**Criterios para salir de la beta:**

- Al menos dos o tres semanas de uso real (tuyo y de alguien más) sin perder datos.
- Restaurar una copia de seguridad de la beta anterior funciona sin errores.
- Ninguna issue abierta con la etiqueta `bug` que afecte a guardar entrenos o a los datos.

## Antes de la primera release (una sola vez)

1. Sube el repositorio a GitHub y comprueba que la CI pasa en verde en `main`.
2. Sustituye `OWNER` por tu usuario de GitHub en `CHANGELOG.md` y en `docs/release-notes/`.
3. En *Settings → Actions → General → Workflow permissions*, deja marcada **Read and write permissions** (el flujo necesita crear la release).
4. Opcional: en *Settings → General*, añade una descripción, la web y los temas (`fitness`, `workout-tracker`, `spring-boot`, `react`, `pwa`).

## Pasos de cada versión

1. **Número**: cámbialo en `frontend/package.json` (y ejecuta `npm install --package-lock-only` en `frontend/`) y en `backend/pom.xml`.
2. **Historial**: en `CHANGELOG.md`, pasa lo de *Sin publicar* a una sección nueva con el número y la fecha.
3. **Notas**: crea `docs/release-notes/v<número>.md`. Es lo que verá la gente en la página de la release: qué ha cambiado, cómo instalarla y qué limitaciones tiene. Copia la de la versión anterior como plantilla.
4. **Comprueba** que todo pasa en local (las mismas órdenes que la CI):

   ```bash
   cd backend && ./mvnw verify
   cd ../frontend && npm run lint && npm test && npm run check:i18n && npm run build
   ```

5. **Commit y etiqueta**:

   ```bash
   git add -A
   git commit -m "Versión 1.0.0-beta.1"
   git push
   git tag -a v1.0.0-beta.1 -m "MyHomeGym 1.0.0-beta.1"
   git push origin v1.0.0-beta.1
   ```

6. En la pestaña *Actions* verás el flujo **Release**. Si pasa, la release aparece en *Releases* con `myhomegym-<número>.jar` y su suma SHA-256. GitHub añade solo el código fuente en `.zip` y `.tar.gz`, que es lo que exige la GPL.

## Si algo sale mal

- **El flujo falla en "Comprobar que la etiqueta coincide"**: la etiqueta, `package.json` y `pom.xml` no tienen el mismo número, o falta el fichero de notas. Corrígelo, borra la etiqueta y vuelve a subirla:

  ```bash
  git tag -d v1.0.0-beta.1
  git push origin :refs/tags/v1.0.0-beta.1
  ```

- **Has publicado una versión con un fallo grave**: no la borres; publica enseguida la siguiente (`beta.2` o `x.y.z+1`) con la corrección y explícalo en sus notas.
