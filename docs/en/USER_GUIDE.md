# MyHomeGym user guide

**English** · [Español](../es/FUNCIONALIDAD.md)

What the app does, screen by screen, and the rules behind it. It's meant for anyone who wants to use it, test it or change it. How it's built is in [ARCHITECTURE.md](ARCHITECTURE.md). The formal requirements and their acceptance tests are only in Spanish, in [REQUISITOS_FUNCIONALES_Y_ACEPTACION.md](../es/REQUISITOS_FUNCIONALES_Y_ACEPTACION.md).

## What it is

An app to log strength workouts in a home gym. You plan your routines, follow them set by set with your phone in your hand, and the app tells you when to add weight, which records you've beaten and which muscles you've trained more or less.

Everything runs on your own server: the backend stores the data in an H2 database, in a file inside `backend/data/` (or the `data/` folder next to the `.jar`). There is no third-party cloud. The only things that go out to the internet are the catalog photos (from GitHub) and the machine translation of the instructions into Spanish (can be turned off).

## Screen map

| Screen | Route | What it's for |
| --- | --- | --- |
| Sign in | (no session) | Create an account or sign in |
| Onboarding | (first time) | Weight, height and measurements to work out your BMI |
| Home | `/` | What's planned for today and how your week is going |
| Train | `/entrenar` | Pick a routine or a free workout, and log it |
| Routines | `/rutinas` | Your routines, folders and templates |
| Routine detail | `/rutinas/:id` | Exercises, order, sets and rest of a routine |
| Catalog | `/catalogo` | The 876 exercises plus your own |
| Exercise detail | `/catalogo/:id` | Photos, muscles, instructions and history |
| Progress | `/progreso` | Summary, strength, records and body measurements |
| Body diagram | `/diagrama-corporal` | Muscles trained per period |
| Profile | `/perfil` | Your details and measurements |
| Settings | `/configuracion` | Language, reminders, backups and deleting data |

On a phone, navigation is a bottom bar with Home, Routines, Train (center button), Catalog and Progress. Profile and Settings are in the account menu (your initial, top right). On wide screens there is a collapsible sidebar with every section.

## Account and session

- **Sign up:** a username of 3 to 40 characters (letters, numbers, dot, hyphen and underscore) and a password of 8 to 128. Two users can't have the same name.
- **Sign in:** after 5 failed attempts in a row the account is locked for 15 minutes, and the app says so. With a wrong password, the message doesn't reveal whether the username or the password was wrong.
- **Session:** the access token (JWT) lasts 15 minutes and lives only in memory. So you don't have to type your password every time, a refresh token in an HttpOnly cookie lasts 30 days and changes on every use. If someone reuses a refresh token that was already used, all of that user's sessions are closed.
- **Isolation:** the server takes your identity from the token, never from what the browser sends. If you ask for or change someone else's data, the answer is the same as if it didn't exist.
- **Sign out:** from the account menu. It deletes the cookie and revokes the refresh token.

## Onboarding

The first time you sign in, the app asks in three steps for your name (optional), body weight and height; then waist, chest and leg (optional); and finally shows your BMI and its category. The profile is saved when you press **Start** on that last step. You can change everything later in Profile.

## Home

1. **Today:** if you have an active routine scheduled for today, it suggests it with a button to start it. If you've already trained today, it says so and offers another session. If there's no routine for today, it offers a free workout.
2. **Your best set from the last session:** a barbell loaded with the real plates of that set (per side), with the weight, the exercise and the reps.
3. **Last 7 days:** workouts, volume, sets, time and streak.
4. **Recent sessions:** tap one to open it. You can correct weights and reps, or copy it as text (for WhatsApp) or as CSV. When you save a correction, the session volume and the records of that session and the following ones are recalculated: if you once logged 100 kg by mistake, that record disappears and the next session's record counts again. Everything is saved together, or nothing is.
5. **Your records:** your latest records, grouped by exercise.

**Streak:** consecutive days with at least one workout, counting from today or from yesterday (if you haven't trained yet today, the streak is still alive). There is also a streak in weeks (Monday to Sunday).

## Routines

- **Create and edit:** name, days of the week (tap them), color, optional description, folder, and whether it's active or paused. Paused routines aren't suggested for training.
- **Delete:** asks for confirmation. The routine and its list of exercises are deleted in a single operation. Workouts you already did with it are kept.
- **Folders:** to group routines. You move a routine to another folder, or out to "No folder", when editing it. If you delete a folder, its routines aren't deleted: they move to "No folder".
- **Starter templates:** Full Body 3 days, Push Pull Legs, Upper Lower 4 days and Strength 5x5. One tap creates a routine with its exercises, sets, reps and rest.
- **Routine detail:** the list of exercises. From here you add them (search with photos, multiple selection), remove them and reorder them by dragging the handle on the left. The new order shows immediately and is saved in one go; if it can't be saved, the app tells you and goes back to the previous order. Tap an exercise to adjust its sets, its target reps (a number, like 5, or a range, like 8-12) and the rest between sets.

## Train

### Choosing

The screen shows today's routine first, then the rest of your active routines and, at the end, the free workout. You can also start a routine directly from its detail page.

### Guided workout (with a routine)

- One exercise at a time, with its target (sets × reps and rest), the routine's list of exercises and what comes next.
- **Set table:** for each set, what you did last time, today's weight and reps, and a button to mark it as done. Marking it starts the rest timer.
- **Set options:** type (normal, warm-up, drop set or failure), effort as RPE (6 to 10, in half points), or remove it. You can also add sets.
- **Weight suggestion (double progression):** if last time you hit the top of the rep range (or the fixed number, as in a 5x5) on every working set, the app suggests adding 2.5 kg and applies it with one tap. Warm-up sets don't count for this rule and don't go up in weight.
- **Notes** per exercise for that session.

### Free workout

You add exercises with the search as you train. If you've done that exercise before, it comes with last time's sets filled in. Otherwise it works like the guided workout.

### During the workout

- **Fixed header** with the stopwatch, the Finish button and a menu to pause or resume, open the plate calculator or discard the workout.
- **The clock doesn't drift:** the stopwatch and the rest timer use the real time. If you lock your phone or switch apps, they show the right time when you come back.
- **Rest:** a countdown bar, ±15 seconds and a button to skip it. When it ends there's a double beep and the phone vibrates (if it can). If the rest-finished reminder is on and the app is in the background, a notification arrives at the exact time: if you make the rest longer or shorter, the notification moves with it, and if you skip it, it's cancelled without sounding.
- **Plate calculator:** with the target weight and the bar (20 kg by default), it tells you which plates to load on each side using 25, 20, 15, 10, 5, 2.5 and 1.25 kg plates, and draws them. If the exact weight isn't possible, it gives the closest one.
- **Recovery:** the workout in progress is saved in the browser on every change. If you close the tab or it reloads, you continue where you left off.

### Finishing

- The workout and all its sets are saved together in one operation: either everything is saved or nothing is.
- The duration comes from the stopwatch (without pauses), unless you change it by hand.
- Sets with 0 reps aren't saved. Sets with 0 kg are (bodyweight exercises).
- If the server doesn't answer when you finish, the app tells you and the workout stays open, with the stopwatch running, so you can press Finish again.
- The **summary** shows duration, volume, sets, the breakdown by exercise, your notes and the records you beat. From there you can share an image of the session.

## Volume, 1RM and records

- **Volume of a set** = weight × reps. Warm-up sets never count towards volume, records or the muscle map.
- **Estimated 1RM** with the Epley formula: weight × (1 + reps / 30). With a single rep, the 1RM is the weight itself.
- **Personal records**, checked when each workout is finished. At most one per type and exercise in each session: if you go up 60, 62.5 and 65 kg, that's one record (65 kg), not three.
  - *Max weight:* the heaviest you've lifted in an exercise.
  - *Reps at a given weight:* more reps than ever with that weight. The first time you use a weight doesn't count: there's no mark to beat.
  - *Best set:* the set with the most volume in that exercise.
  - *Session:* the workout with the most total volume.

## Catalog

- **876 exercises** from free-exercise-db (public domain), with two photos each (start and end position). On the server they're in `backend/src/main/resources/catalog/exercises/`, one file per primary muscle and one exercise per line.
- **Names:** the original English names in English, translated by hand in Spanish. Muscles, equipment, level and category use a fixed, translated vocabulary.
- **Instructions:** in English they're shown as they are. In Spanish they're machine-translated the first time someone opens the exercise and stored for good, always addressing the user as "tú", like the rest of the app. If the translator fails, they're shown in English with a notice.
- **Search and filter:** by text (Spanish or original name), muscle group, equipment and level, or show only your own. The grid loads 40 at a time.
- **Your own exercises:** name, muscle group, equipment and instructions (one step per line). They can be edited and deleted. Deleting one removes it from the routines that used it and deletes its note; the sets you already did with it stay in your history.
- **Exercise detail:** photos that alternate as an animation, primary and secondary muscles, level, mechanics, force type, how to do it, your history (max weight, 1RM, recent sessions, chart) and a personal note, which is stored on the server and included in the backup. Notes that older versions kept only in the browser are uploaded automatically the first time you open an exercise.

## Progress

- **Summary:** this week's workouts compared with last week's, weekly volume (the current week in another color) and the muscle map of the last 30 days.
- **Strength:** for each exercise, the best 1RM, the last time, the change and the estimated 1RM curve (best set of each day).
- **Records:** filterable by type, with date and detail.
- **Body:** how your body weight and measurements change over time.

## Muscle map (Body diagram)

- An anatomical figure, front and back. Each muscle is colored by the volume you gave it in the period (7, 30 or 90 days, or all time).
- The primary muscle of each exercise counts 100% of the volume and the secondary ones 35%.
- The color is relative to your most trained muscle, in four levels. Untrained muscles stay grey.
- Tap a muscle to see its volume. Below there's a list from most to least trained, and another with the ones you haven't trained in the period.
- Adductors and abductors aren't drawn on the figure, but they do appear in the lists.

## Profile

Name, weight, height and BMI. Dated **measurements**: weight and, optionally, waist, chest, shoulders, biceps, leg and calf. They can be added and deleted. Their evolution is in Progress, Body tab.

## Settings

- **Language:** Spanish or English. The change is immediate and remembered. Everything comes out in the chosen language: screens, reminders, error messages, the PDF and the text of a copied session.
- **Reminders** (they need the browser's permission):
  - *Streak reminder:* if you're on a streak of 3 or more days and haven't trained today, it reminds you at the time you choose (19:00 by default; on by default). If you train before that time, it doesn't remind you. At most once a day.
  - *Rest finished.*
  - *Send a test.*
- **Your data:**
  - *Full JSON backup* (profile, your own exercises, routines, folders, workouts, sets, measurements, records and exercise notes).
  - *Restore a backup:* adds what's missing without deleting what you already have; the profile is replaced by the one in the backup. It's done in one go on the server: if the backup has any invalid record, nothing is added. When it finishes it says how many records it added and how many you already had.
  - *Workouts as CSV* (export and import) for Excel or Google Sheets, with correct accents and multi-line notes.
  - *PDF summary* to print, in the app's language.
- **Delete all my data:** with confirmation. Deletes everything except the account.

## When something goes wrong

- Error messages come out in your language and without jargon ("That username already exists", "The server isn't responding").
- If a change can't be saved, a notice appears at the top for a few seconds. No failed save goes unnoticed.
- If finishing a workout fails, the workout stays open so you can try again.
- If a screen hits an unexpected error, you get two options: try again, or clear the cache and reload. Clearing the cache keeps the language and the workout in progress; if you have one half done, the screen says so and lets you discard it separately, in case the error comes from it.

## Installing it as an app

It's a PWA: it can be installed on your phone or desktop from the browser (installing it requires HTTPS, except on `localhost`). The interface is cached, but calls to the server never are, so the backend has to be running and reachable. When there's a new version, a notice offers to reload.

## Known limitations

- **Catalog photos** load from the internet (GitHub); offline you see an icon instead. The rest of the app loads nothing from third parties: the fonts are bundled.
- There's no light mode: the app is dark only.
