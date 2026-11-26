> **Note:** The Spanish version is the reference. If the English and Spanish versions ever differ, the Spanish version wins.
> Source: `docs/es/requisitos/01-cuenta-y-perfil.md`

# 1. Account, session and profile

[← Requirements index](../../es/REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## Functional requirements

| Id | Requirement | Priority |
| --- | --- | --- |
| FR-1.01 | The user can create an account with username and password in the own backend. | Must |
| FR-1.02 | The user can log in and receives a JWT access token. | Must |
| FR-1.03 | The session persists across reloads and browser closes for 30 days without asking for the password again. | Must |
| FR-1.04 | The user can log out from the account menu. | Must |
| FR-1.05 | The first time they enter, the user goes through a wizard that asks for name (optional), weight and height, and can add waist, chest and leg. | Must |
| FR-1.06 | The wizard calculates and shows the BMI and its category before finishing. | Should |
| FR-1.07 | The user can edit their name, weight and height in Profile; the BMI is recalculated. | Must |
| FR-1.08 | The user can record dated measurements: weight and, optionally, waist, chest, shoulders, biceps, leg and calf. | Must |
| FR-1.09 | The user can delete a measurement. | Should |

## Business rules

| Id | Rule |
| --- | --- |
| RN-1.01 | Username: 3 to 40 characters, only letters, numbers, dot, hyphen and underscore. Unique in the system. |
| RN-1.02 | Password: 8 to 128 characters. Only its hash is stored (BCrypt). |
| RN-1.03 | After 5 consecutive failed attempts, login for that account is blocked for 15 minutes. |
| RN-1.04 | The login error is the same whether the user does not exist or the password is incorrect, and it takes the same time. |
| RN-1.05 | The access token expires after 15 minutes and is only kept in memory, never in `localStorage`. |
| RN-1.06 | The refresh token travels in an HttpOnly cookie, expires after 30 days and is replaced by a new one on each use. |
| RN-1.07 | If an already used refresh token is presented, all active sessions of that user are revoked. |
| RN-1.08 | The owner of any data is always taken from the JWT, never from the request body. Someone else's data behaves as non-existent. |
| RN-1.09 | BMI = weight (kg) / height (m)². Categories: underweight (< 18.5), normal (< 25), overweight (< 30) and obesity (≥ 30). |
| RN-1.10 | The circumferences of a measurement are optional; weight is mandatory. |

## Acceptance tests

### AC-1.1: Registration with valid and invalid data
- **Given** that user `antonio` does not exist.
- **When** they register with `antonio` and a password of 8 characters or more.
- **Then** the account is created and they enter the app.
- **And** if someone tries to register `antonio` again, or uses a 7-character password, registration is rejected with a clear message.
- *Automated:* `ApiIntegrationTest.registerRejectsDuplicatesAndWeakPasswords`.

### AC-1.2: Lockout after failed attempts
- **Given** a registered user.
- **When** the password fails 5 times in a row.
- **Then** the sixth attempt, even if the password is correct, is rejected for 15 minutes.
- *Automated:* `ApiIntegrationTest.loginFailsWithWrongPasswordAndLocksAfterRepeatedFailures`.

### AC-1.3: Persistent session and refresh rotation
- **Given** a logged-in user.
- **When** they reload the page or return within 30 days.
- **Then** they stay logged in without typing the password.
- **And** each renewal delivers a new refresh token; if the previous one is reused, all their sessions are closed.
- *Automated:* `ApiIntegrationTest.refreshTokenRotatesAndReuseRevokesSession` and `api.test.js › renueva la sesión ante un 401 y repite la petición con el token nuevo`.

### AC-1.4: Expired session
- **Given** that the refresh token is no longer valid.
- **When** the app makes a request and receives 401.
- **Then** it warns that the session has expired and returns to the login screen.
- *Automated:* `api.test.js › avisa de sesión caducada si no se puede renovar`.

### AC-1.5: Protected endpoints
- **When** any data endpoint is called without a token.
- **Then** the response is 401. The catalogue and `/api/health` are public.
- *Automated:* `ApiIntegrationTest.protectedEndpointsRequireToken`.

### AC-1.6: Isolation between users
- **Given** that user A has created a routine.
- **When** user B requests, modifies or deletes it by its id, or tries to create another with that same id.
- **Then** the backend responds as if it did not exist and A's routine does not change.
- *Automated:* `ApiIntegrationTest.usersCannotSeeOrOverwriteEachOthersData`.

### AC-1.7: Initial wizard
- **Given** a newly registered user.
- **When** they enter 78 kg and 178 cm and continue.
- **Then** they see a BMI of 24.6 ("normal") and, when they press Start, they reach Home with the profile saved.
- **And** the profile is not saved until they press Start on the last step: pressing Next never sends it before showing the BMI.
- *The formula is automated in* `calculations.test.js › calculateImc` *and* `classifyImc`*. The full flow, verified with browser test (17/11/2026).*

### AC-1.8: Measurements
- **Given** a user in Profile.
- **When** they add a measurement with only weight, and another with weight and waist.
- **Then** both are saved with their date and appear in Progress → Body.
- **And** if they add a measurement without weight, the app marks it as an error and does not save it.
- *Manual.*

### AC-1.9: Log out
- **When** the user presses Log out in the account menu.
- **Then** they return to the login screen, and reloading the page does not recover the session.
- *Manual.*
