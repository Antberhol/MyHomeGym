# Seguridad

## Versiones con soporte

MyHomeGym está en beta. Solo se corrigen fallos en la última versión publicada en *Releases*.

## Cómo avisar de un problema de seguridad

No abras una issue pública con los detalles. Usa **Security → Report a vulnerability** en este repositorio (aviso privado de GitHub) e indica qué versión usas, cómo reproducirlo y qué impacto tiene. Recibirás respuesta en cuanto sea posible; es un proyecto mantenido por una sola persona en su tiempo libre.

## Qué datos maneja la app

- **Todo se guarda en tu equipo**, en la carpeta `data/` desde la que arrancas el servidor: la base de datos H2 (cuentas, entrenos, medidas, notas) y la clave con la que se firman las sesiones (`jwt-secret.key`). No hay servidor del proyecto ni cuentas en la nube.
- **Contraseñas**: se guardan solo como hash BCrypt.
- **Conexiones salientes**, y solo estas:
  - El servidor envía a [MyMemory](https://mymemory.translated.net/) el texto en inglés de las instrucciones de un ejercicio del catálogo la primera vez que alguien abre su ficha en español (y el correo de contacto, solo si lo configuras en `APP_TRANSLATION_EMAIL`). Nunca envía datos del usuario. Se desactiva con `APP_TRANSLATION_PROVIDER=none` o se cambia por tu propia instancia de LibreTranslate.
  - El navegador descarga las fotos de los ejercicios de `raw.githubusercontent.com` (repositorio free-exercise-db).
- **Sin telemetría**, analítica ni anuncios.

## Recomendaciones de uso

- Por defecto sirve HTTP en el puerto 8080, pensado para tu equipo o tu red de casa. Para exponerla a internet, ponla detrás de HTTPS (un proxy inverso) y arranca con `APP_COOKIES_SECURE=true`.
- Haz copias de seguridad de la carpeta `data/` o exporta la copia en JSON desde la app. No compartas `jwt-secret.key`.
- El `.jar` de cada release lo construye GitHub Actions a partir de la etiqueta publicada; comprueba la descarga con su fichero `.sha256`.
