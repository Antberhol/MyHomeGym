# 13. Trazabilidad

[← Índice de la ERS](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

Cuatro matrices: de los objetivos a los casos de uso, de los casos de uso a los requisitos funcionales, de los tests a lo que cubren, y la cobertura de cada regla de negocio y prueba de aceptación.

## 13.1 Objetivos × casos de uso

| Caso de uso | OBJ-01 | OBJ-02 | OBJ-03 | OBJ-04 | OBJ-05 | OBJ-06 | OBJ-07 | OBJ-08 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| CU-01 | ● |  |  |  |  |  | ● |  |
| CU-02 | ● |  |  |  |  |  | ● |  |
| CU-03 |  |  |  |  |  |  | ● |  |
| CU-04 | ● |  |  |  |  |  |  |  |
| CU-05 | ● |  |  |  | ● |  |  |  |
| CU-06 |  | ● |  |  |  |  |  |  |
| CU-07 |  | ● |  |  |  |  |  |  |
| CU-08 |  | ● |  |  |  |  |  |  |
| CU-09 |  | ● |  |  |  |  |  |  |
| CU-10 |  |  | ● | ● |  |  |  |  |
| CU-11 |  |  | ● |  |  |  |  |  |
| CU-12 |  |  | ● |  | ● |  |  |  |
| CU-13 |  |  |  | ● | ● |  |  |  |
| CU-14 |  |  |  |  | ● |  |  |  |
| CU-15 |  |  |  |  |  | ● |  |  |
| CU-16 |  |  |  |  |  | ● |  |  |
| CU-17 |  |  |  |  |  | ● |  |  |
| CU-18 |  |  |  |  |  |  | ● |  |
| CU-19 |  |  |  |  |  |  | ● |  |
| CU-20 |  |  |  |  |  |  | ● |  |
| CU-21 |  |  | ● |  |  |  |  | ● |
| CU-22 |  |  |  |  | ● |  |  |  |

Todos los objetivos están cubiertos por al menos un caso de uso. OBJ-08 (móvil e idiomas) se cubre sobre todo con requisitos no funcionales (RNF-3.x, RNF-7.03).

## 13.2 Casos de uso × requisitos funcionales

| Caso de uso | Requisitos funcionales |
| --- | --- |
| CU-01 | FR-1.01 |
| CU-02 | FR-1.02, FR-1.03 |
| CU-03 | FR-1.04 |
| CU-04 | FR-1.05, FR-1.06 |
| CU-05 | FR-1.07, FR-1.08, FR-1.09, FR-4.09 |
| CU-06 | FR-2.01, FR-2.02, FR-2.03 |
| CU-07 | FR-2.04, FR-2.05, FR-2.06, FR-2.07 |
| CU-08 | FR-2.09, FR-2.11 |
| CU-09 | FR-2.08 |
| CU-10 | FR-2.10, FR-3.01, FR-3.03 a FR-3.11, FR-3.13 a FR-3.18, FR-4.01, FR-4.05 |
| CU-11 | FR-3.02 a FR-3.10, FR-3.12 a FR-3.18, FR-4.05 |
| CU-12 | FR-3.19, FR-4.04 |
| CU-13 | FR-4.02 a FR-4.09, FR-4.14 |
| CU-14 | FR-4.10 a FR-4.13 |
| CU-15 | FR-5.01 a FR-5.07 |
| CU-16 | FR-5.08 |
| CU-17 | FR-5.09 |
| CU-18 | FR-6.01, FR-6.02, FR-6.04, FR-6.05 |
| CU-19 | FR-6.03, FR-6.04 |
| CU-20 | FR-6.06 |
| CU-21 | FR-6.07, FR-6.08, FR-6.09, FR-6.10 |
| CU-22 | FR-6.07 |

Requisitos funcionales sin caso de uso: FR-6.11. FR-6.11 (instalar como PWA) se trata como requisito de plataforma y se verifica con RNF-7.03.

## 13.3 Tests automáticos × requisitos

| Test | Cubre |
| --- | --- |
| `ApiIntegrationTest.protectedEndpointsRequireToken` | AC-1.5, RNF-1.04 |
| `ApiIntegrationTest.registerRejectsDuplicatesAndWeakPasswords` | AC-1.1, RN-1.01, RN-1.02 |
| `ApiIntegrationTest.loginFailsWithWrongPasswordAndLocksAfterRepeatedFailures` | AC-1.2, RN-1.03, RN-1.04, RNF-1.06 |
| `ApiIntegrationTest.refreshTokenRotatesAndReuseRevokesSession` | AC-1.3, RN-1.05, RN-1.06, RN-1.07 |
| `ApiIntegrationTest.usersCannotSeeOrOverwriteEachOthersData` | AC-1.6, RN-1.08, RNF-1.05 |
| `ApiIntegrationTest.completedTrainingIsSavedWithItsSetsAndDeletedTogether` | AC-3.4, RN-3.05, RN-3.06, RNF-2.01 |
| `ApiIntegrationTest.backupExportsAndRestoresUserData` | AC-6.1, RN-6.01, RN-6.05 |
| `ApiIntegrationTest.catalogIsPublicAndTranslated` | AC-5.2, RN-5.08 |
| `CatalogFilesTest.eachFileHoldsOneMuscleAndOneExercisePerLine` | AC-5.1, RN-5.01, RN-5.02, RN-5.03 |
| `CatalogAndTranslationTest.everyExerciseHasASpanishNameAndAKnownGroup` | AC-5.1, RN-5.03, RN-5.04 |
| `CatalogAndTranslationTest.translationsAreCachedAndFailuresFallBackToOriginal` | AC-5.4, RN-5.05, RN-5.06, RNF-2.04 |
| `ExerciseNotesApiTest.notesArePrivateAndTravelWithTheBackup` | AC-5.6, RN-5.10, RN-6.01, RNF-1.05 |
| `ExerciseNotesApiTest.noteWithoutExerciseIsRejected` | AC-5.6, RN-5.10, RNF-1.08 |
| `DataIntegrityApiTest.deletingAFolderKeepsItsRoutinesWithoutFolder` | AC-2.7, RN-2.06, RNF-2.01 |
| `DataIntegrityApiTest.patchingAFieldToNullClearsIt` | AC-2.8, RN-2.09 |
| `DataIntegrityApiTest.deletingACustomExerciseRemovesItFromRoutinesAndKeepsHistory` | AC-5.8, RN-5.12, RNF-2.01 |
| `DataIntegrityApiTest.invalidValuesAreRejected` | AC-2.9, RN-2.10, RN-3.12, RNF-1.08 |
| `DataIntegrityApiTest.mergeAddsWhatIsMissingWithoutDeletingAndIsAtomic` | AC-6.2, RN-6.03, RNF-1.08, RNF-2.01 |
| `DataIntegrityApiTest.mergeNeverTakesAnotherUsersRecords` | AC-6.2, RN-6.03, RNF-1.05 |
| `TrainingCorrectionApiTest.correctingASessionUpdatesSetsVolumeAndRecordsTogether` | AC-4.9, RN-4.15, RNF-1.05 |
| `TrainingCorrectionApiTest.anInvalidCorrectionChangesNothing` | AC-4.9, RN-4.15, RNF-1.05, RNF-1.08, RNF-2.01 |
| `SpanishRegisterTest.mixedInstructionsEndUpInTu` | AC-5.9, RN-5.13 |
| `SpanishRegisterTest.leavesNounsAndTextAlreadyInTuUntouched` | AC-5.9, RN-5.13 |
| `SpanishRegisterTest.appliesOnlyToSpanishAndToCachedTranslationsToo` | AC-5.9, RN-5.05, RN-5.13 |
| `SpaRoutesTest.reactRoutesForwardToIndex` | RNF-7.02 |
| `api.test.js` (8 casos) | AC-1.3, AC-1.4, AC-6.8, AC-6.9, RN-6.11, RNF-1.03, RNF-3.08, RNF-5.05 |
| `prs.test.js` (9 casos) | AC-4.2, AC-4.8, RN-4.05, RN-4.06, RN-4.07, RN-4.08, RN-4.09 |
| `calculations.test.js` (20 casos) | AC-1.7, AC-4.3, RN-1.09, RN-3.07, RN-4.04 |
| `ui-rules.test.js` (8 casos) | AC-2.5, AC-4.1, AC-4.4, RN-2.02, RN-2.03, RN-4.03, RN-4.10, RN-4.11, RN-4.14, RNF-3.05 |
| `body-figure.test.js` (3 casos) | AC-4.4, RN-4.12, RN-4.13 |
| `theme.test.js` (2 casos) | RNF-4.01, RNF-4.02 |
| `backup-and-notes.test.js` (8 casos) | AC-2.8, AC-5.6, AC-6.3, RN-2.09, RN-5.10, RN-5.11, RN-6.02 |
| `notifications.test.js` (1 caso) | AC-6.6, RN-6.07, RN-6.09 |
| `workout-rules.test.js` (14 casos) | AC-3.2, AC-3.6, AC-3.10, RN-2.01, RN-3.01, RN-3.02, RN-3.03, RN-3.07 |
| `streaks-and-plates.test.js` (18 casos) | AC-3.7, AC-4.1, AC-6.6, RN-3.09, RN-4.01, RN-4.02, RN-4.03, RN-6.06 |
| `workout-timer.test.js` (8 casos) | AC-3.1, AC-3.11, AC-3.12, RN-3.04, RN-3.10, RN-3.11, RNF-2.07 |
| `exports.test.js` (8 casos) | AC-6.5, AC-6.10, RN-6.04, RN-6.09 |
| `session-correction.test.js` (4 casos) | AC-4.9, RN-4.05, RN-4.07, RN-4.08, RN-4.15, RN-3.07 |
| `browser-cache.test.js` (2 casos) | AC-6.12, RN-6.14, RNF-2.02 |
| `npm run check:i18n` | AC-6.7, RN-6.09, RNF-6.05 |

## 13.4 Cobertura de las reglas de negocio

| Regla | Verificación |
| --- | --- |
| RN-1.01 | Automatizada (ApiIntegrationTest) |
| RN-1.02 | Automatizada (ApiIntegrationTest) |
| RN-1.03 | Automatizada (ApiIntegrationTest) |
| RN-1.04 | Automatizada (ApiIntegrationTest) |
| RN-1.05 | Automatizada (ApiIntegrationTest) |
| RN-1.06 | Automatizada (ApiIntegrationTest) |
| RN-1.07 | Automatizada (ApiIntegrationTest) |
| RN-1.08 | Automatizada (ApiIntegrationTest) |
| RN-1.09 | Automatizada (calculations.test.js) |
| RN-1.10 | Manual (ver la prueba de aceptación del módulo) |
| RN-2.01 | Automatizada (workout-rules.test.js) |
| RN-2.02 | Automatizada (ui-rules.test.js) |
| RN-2.03 | Automatizada (ui-rules.test.js) |
| RN-2.04 | Manual (ver la prueba de aceptación del módulo) |
| RN-2.05 | Manual (ver la prueba de aceptación del módulo) |
| RN-2.06 | Automatizada (DataIntegrityApiTest) |
| RN-2.07 | Manual (ver la prueba de aceptación del módulo) |
| RN-2.08 | Manual (ver la prueba de aceptación del módulo) |
| RN-2.09 | Automatizada (DataIntegrityApiTest, backup-and-notes.test.js) |
| RN-2.10 | Automatizada (DataIntegrityApiTest) |
| RN-3.01 | Automatizada (workout-rules.test.js) |
| RN-3.02 | Automatizada (workout-rules.test.js) |
| RN-3.03 | Automatizada (workout-rules.test.js) |
| RN-3.04 | Automatizada (workout-timer.test.js) |
| RN-3.05 | Automatizada (ApiIntegrationTest) |
| RN-3.06 | Automatizada (ApiIntegrationTest) |
| RN-3.07 | Automatizada (calculations.test.js, session-correction.test.js, workout-rules.test.js) |
| RN-3.08 | Manual (ver la prueba de aceptación del módulo) |
| RN-3.09 | Automatizada (streaks-and-plates.test.js) |
| RN-3.10 | Automatizada (workout-timer.test.js) |
| RN-3.11 | Automatizada (workout-timer.test.js) |
| RN-3.12 | Automatizada (DataIntegrityApiTest) |
| RN-4.01 | Automatizada (streaks-and-plates.test.js) |
| RN-4.02 | Automatizada (streaks-and-plates.test.js) |
| RN-4.03 | Automatizada (streaks-and-plates.test.js, ui-rules.test.js) |
| RN-4.04 | Automatizada (calculations.test.js) |
| RN-4.05 | Automatizada (prs.test.js, session-correction.test.js) |
| RN-4.06 | Automatizada (prs.test.js) |
| RN-4.07 | Automatizada (prs.test.js, session-correction.test.js) |
| RN-4.08 | Automatizada (prs.test.js, session-correction.test.js) |
| RN-4.09 | Automatizada (prs.test.js) |
| RN-4.10 | Automatizada (ui-rules.test.js) |
| RN-4.11 | Automatizada (ui-rules.test.js) |
| RN-4.12 | Automatizada (body-figure.test.js) |
| RN-4.13 | Automatizada (body-figure.test.js) |
| RN-4.14 | Automatizada (ui-rules.test.js) |
| RN-4.15 | Automatizada (TrainingCorrectionApiTest, session-correction.test.js) |
| RN-5.01 | Automatizada (CatalogFilesTest) |
| RN-5.02 | Automatizada (CatalogFilesTest) |
| RN-5.03 | Automatizada (CatalogAndTranslationTest, CatalogFilesTest) |
| RN-5.04 | Automatizada (CatalogAndTranslationTest) |
| RN-5.05 | Automatizada (CatalogAndTranslationTest, SpanishRegisterTest) |
| RN-5.06 | Automatizada (CatalogAndTranslationTest) |
| RN-5.07 | Manual (ver la prueba de aceptación del módulo) |
| RN-5.08 | Automatizada (ApiIntegrationTest) |
| RN-5.09 | Manual (ver la prueba de aceptación del módulo) |
| RN-5.10 | Automatizada (ExerciseNotesApiTest, backup-and-notes.test.js) |
| RN-5.11 | Automatizada (backup-and-notes.test.js) |
| RN-5.12 | Automatizada (DataIntegrityApiTest) |
| RN-5.13 | Automatizada (SpanishRegisterTest) |
| RN-6.01 | Automatizada (ApiIntegrationTest, ExerciseNotesApiTest) |
| RN-6.02 | Automatizada (backup-and-notes.test.js) |
| RN-6.03 | Automatizada (DataIntegrityApiTest) |
| RN-6.04 | Automatizada (exports.test.js) |
| RN-6.05 | Automatizada (ApiIntegrationTest) |
| RN-6.06 | Automatizada (streaks-and-plates.test.js) |
| RN-6.07 | Automatizada (notifications.test.js) |
| RN-6.08 | Manual (ver la prueba de aceptación del módulo) |
| RN-6.09 | Automatizada (check:i18n, exports.test.js, notifications.test.js) |
| RN-6.10 | Manual (ver la prueba de aceptación del módulo) |
| RN-6.11 | Automatizada (api.test.js) |
| RN-6.12 | Manual (ver la prueba de aceptación del módulo) |
| RN-6.13 | Manual (ver la prueba de aceptación del módulo) |
| RN-6.14 | Automatizada (browser-cache.test.js) |

**62 de 74 reglas** tienen al menos un test automático. Las 12 restantes se comprueban con pruebas de aceptación manuales.

## 13.5 Cobertura de las pruebas de aceptación

| Prueba | Estado |
| --- | --- |
| AC-1.1 | Automatizada |
| AC-1.2 | Automatizada |
| AC-1.3 | Automatizada |
| AC-1.4 | Automatizada |
| AC-1.5 | Automatizada |
| AC-1.6 | Automatizada |
| AC-1.7 | Automatizada |
| AC-1.8 | Manual |
| AC-1.9 | Manual |
| AC-2.1 | Manual |
| AC-2.2 | Manual |
| AC-2.3 | Manual |
| AC-2.4 | Manual |
| AC-2.5 | Automatizada |
| AC-2.6 | Manual |
| AC-2.7 | Automatizada |
| AC-2.8 | Automatizada |
| AC-2.9 | Automatizada |
| AC-3.1 | Automatizada |
| AC-3.2 | Automatizada |
| AC-3.3 | Prueba de navegador (13/11/2026) |
| AC-3.4 | Automatizada |
| AC-3.5 | Manual |
| AC-3.6 | Automatizada |
| AC-3.7 | Automatizada |
| AC-3.8 | Manual |
| AC-3.9 | Prueba de navegador (13/11/2026) |
| AC-3.10 | Automatizada |
| AC-3.11 | Automatizada |
| AC-3.12 | Automatizada |
| AC-4.1 | Automatizada |
| AC-4.2 | Automatizada |
| AC-4.3 | Automatizada |
| AC-4.4 | Automatizada |
| AC-4.5 | Manual |
| AC-4.6 | Manual |
| AC-4.7 | Manual |
| AC-4.8 | Automatizada |
| AC-4.9 | Automatizada |
| AC-5.1 | Automatizada |
| AC-5.2 | Automatizada |
| AC-5.3 | Manual |
| AC-5.4 | Automatizada |
| AC-5.5 | Manual |
| AC-5.6 | Automatizada |
| AC-5.7 | Manual |
| AC-5.8 | Automatizada |
| AC-5.9 | Automatizada |
| AC-6.1 | Automatizada |
| AC-6.2 | Automatizada |
| AC-6.3 | Automatizada |
| AC-6.4 | Manual |
| AC-6.5 | Automatizada |
| AC-6.6 | Automatizada |
| AC-6.7 | Manual |
| AC-6.8 | Automatizada |
| AC-6.9 | Automatizada |
| AC-6.10 | Automatizada |
| AC-6.11 | Prueba de navegador (17/11/2026) |
| AC-6.12 | Automatizada |

**43 de 60 pruebas** están automatizadas o verificadas con una prueba de navegador.
