> **Note:** The Spanish version is the reference. If the English and Spanish versions ever differ, the Spanish version wins.
> Source: `docs/es/requisitos/00-introduccion.md`

# 0. Introduction, context and objectives

[← SRS Index](../../es/REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## 0.1 Purpose

This document is the **Software Requirements Specification (SRS)** for MyHomeGym. It defines what the system must do, under which rules and with which quality, so that each requirement can be verified. It is aimed at:

- **The author and maintainer** of the project, to decide what to build and how to check that it is right.
- **Anyone contributing code** (people or AI assistants), to understand the expected behaviour before changing it.
- **Evaluators** (teachers, portfolio reviewers), to assess the scope and quality of the project.

## 0.2 Scope

**MyHomeGym** is an installable web app (PWA) to plan and log strength training in a home gym, and to analyse progression.

| In scope | Out of scope |
| --- | --- |
| Routines, guided and free workouts, sets with kilos, reps, type and RPE | Cardio exercise with GPS, heart-rate monitors or wearables |
| Catalogue of 876 exercises and custom exercises | Exercise videos, personal trainer or AI that generates routines |
| Records, estimated 1RM, volume, streaks and muscle map | Nutrition, calories or diet plans |
| Body measurements and BMI | Medical diagnosis or health recommendations |
| JSON, CSV and PDF backups | Social network, followers or sharing inside the app |
| Spanish and English | Payments, subscriptions or advertising |

## 0.3 References

| Reference | Use |
| --- | --- |
| ISO/IEC/IEEE 29148:2018, *Requirements engineering* | SRS structure and requirement quality attributes |
| A. Durán and B. Bernárdez, *Methodology for eliciting software system requirements* (University of Seville) | Templates for objectives, actors, use cases and information requirements |
| ISO/IEC 25010:2023, *Product quality model* | Classification of non-functional requirements |
| Robertson and Robertson, *Volere Requirements Specification Template* | Measurable fit criteria (*fit criteria*) |
| [USER_GUIDE.md](../USER_GUIDE.md) and [ARCHITECTURE.md](../ARCHITECTURE.md) | Functional and technical description of the implemented system |

## 0.4 Conventions

| Prefix | Element | File |
| --- | --- | --- |
| OBJ-nn | System objective | this file |
| ACT-nn | Actor | [08](../../es/requisitos/08-actores-y-casos-de-uso.md) |
| CU-nn | Use case | [08](../../es/requisitos/08-actores-y-casos-de-uso.md), [09](../../es/requisitos/09-casos-de-uso-detallados.md) |
| RI-nn | Information requirement (what data the system stores) | [10](../../es/requisitos/10-requisitos-de-informacion.md) |
| FR-m.nn | Functional requirement of module *m* | [01](../../es/requisitos/01-cuenta-y-perfil.md) to [06](../../es/requisitos/06-datos-y-configuracion.md) |
| RN-m.nn | Business rule | [01](../../es/requisitos/01-cuenta-y-perfil.md) to [06](../../es/requisitos/06-datos-y-configuracion.md) |
| AC-m.n | Acceptance test (*Given / When / Then*) | [01](../../es/requisitos/01-cuenta-y-perfil.md) to [06](../../es/requisitos/06-datos-y-configuracion.md) |
| RNF-m.nn | Non-functional requirement with measurable criterion | [07](../../es/requisitos/07-no-funcionales.md) |
| RES-nn, SUP-nn, EVO-nn | Constraint, assumption, planned evolution | [11](../../es/requisitos/11-restricciones-y-supuestos.md) |

**Attributes of each requirement** (shown when they add information):

- **Priority (MoSCoW):** *Must* (essential), *Should* (important), *Could* (desirable), *Won't* (discarded in this version).
- **Status:** *Proposed*, *Implemented* (it is in the code) or *Verified* (it is also checked by an automated test or an executed acceptance test).
- **Stability:** *High* (unlikely to change), *Medium* or *Low* (likely to change).
- **Source:** where the requirement comes from: *Author* (author decision), *Domain* (usual strength-training practice), *Legal* or *Platform* (browser, Android, Google Play).

Unless stated otherwise, all requirements in modules 1 to 6 are **implemented**. Their priority is in the table of each module.

## 0.5 Problem context

People who train strength at home usually log their sets in a notebook, in phone notes or in general-purpose apps. This raises several problems:

1. **During the workout**, with hands busy and heart rate up, writing is slow. You cannot see at a glance what you did last time.
2. **Progressing** requires remembering when to increase weight. Without data, you stall or increase too soon.
3. **Muscle balance** (which groups are undertrained) is not visible in a list of sets.
4. **Data** stays in a third-party app, with ads or subscription, and cannot be exported.

## 0.6 Stakeholders

| Stakeholder | Interest | How they participate |
| --- | --- | --- |
| User who trains at home | Log quickly, progress, see their evolution | Main source of functional and usability requirements |
| Author and maintainer | Project maintainable by a single person, valuable as portfolio | Decides the scope, constraints and priorities |
| External contributor (if the project is published) | Understand the code and rules to propose changes | Reads this SRS, `CONTRIBUTING.md` and, if using AI, `AGENTS.md` |
| Academic or technical evaluator | See a complete engineering process | Reviews the SRS and traceability with tests |

## 0.7 System objectives

| Id | Objective | Description | Priority | Stability |
| --- | --- | --- | --- | --- |
| OBJ-01 | Manage account and profile | The system shall allow each user to have a private account with their basic personal data (weight, height, BMI) and their body evolution. | Must | High |
| OBJ-02 | Plan training | The system shall allow creating, organising and reusing routines with their exercises, target sets, reps and rests. | Must | High |
| OBJ-03 | Log workouts quickly | The system shall allow logging each set during the workout with minimal effort, showing what was done last time and controlling rests. | Must | High |
| OBJ-04 | Guide progression | The system shall indicate when to increase weight, detect personal records and estimate maximum strength (1RM). | Should | Medium |
| OBJ-05 | Analyse progress | The system shall show the evolution of volume, strength, streaks, records, measurements and workload distribution by muscle. | Should | Medium |
| OBJ-06 | Offer an exercise catalogue | The system shall offer a broad, translated catalogue, with photos and instructions, extendable with custom exercises. | Must | High |
| OBJ-07 | Guarantee data ownership and privacy | The system shall store data in the user's own infrastructure, isolate it between users and allow exporting, restoring and deleting it. | Must | High |
| OBJ-08 | Be usable on mobile and in two languages | The system shall be usable with one hand on a mobile, installable as an app and work in Spanish and English. | Must | Medium |

**Sub-objectives and relation to use cases:** see the OBJ × CU matrix in [13-trazabilidad.md](../../es/requisitos/13-trazabilidad.md).
