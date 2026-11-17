# Security

**English** · [Español](SECURITY.es.md)

## Supported versions

MyHomeGym is in beta. Only the latest version published under *Releases* gets fixes.

## Reporting a security issue

Please don't open a public issue with the details. Use **Security → Report a vulnerability** in this repository (GitHub's private reporting) and include the version you use, how to reproduce it and its impact. You'll get an answer as soon as possible; this is a project maintained by one person in their free time.

## What data the app handles

- **Everything is stored on your machine**, in the `data/` folder of the directory you start the server from: the H2 database (accounts, workouts, measurements, notes) and the key used to sign sessions (`jwt-secret.key`). There is no project server and no cloud account.
- **Passwords** are stored only as BCrypt hashes.
- **Outgoing connections**, and only these:
  - The server sends [MyMemory](https://mymemory.translated.net/) the English instruction text of a catalog exercise the first time someone opens it in Spanish (plus your contact email, only if you set `APP_TRANSLATION_EMAIL`). It never sends user data. Turn it off with `APP_TRANSLATION_PROVIDER=none`, or replace it with your own LibreTranslate instance.
  - The browser downloads exercise photos from `raw.githubusercontent.com` (the free-exercise-db repository).
- **No telemetry**, analytics or ads.

## Recommendations

- By default it serves plain HTTP on port 8080, meant for your computer or your home network. To expose it to the internet, put it behind HTTPS (a reverse proxy) and start it with `APP_COOKIES_SECURE=true`.
- Back up the `data/` folder, or export the JSON backup from the app. Don't share `jwt-secret.key`.
- The `.jar` of each release is built by GitHub Actions from the published tag; verify the download with its `.sha256` file.
