# 0. Introducción, contexto y objetivos

[← Índice de la ERS](../REQUISITOS_FUNCIONALES_Y_ACEPTACION.md)

## 0.1 Propósito

Este documento es la **Especificación de Requisitos Software (ERS)** de MyHomeGym. Define qué debe hacer el sistema, con qué reglas y con qué calidad, de forma que cada requisito se pueda verificar. Va dirigido a:

- **El autor y mantenedor** del proyecto, para decidir qué construir y cómo comprobar que está bien.
- **Quien contribuya al código** (personas o asistentes de IA), para entender el comportamiento esperado antes de cambiarlo.
- **Evaluadores** (profesorado, revisores de un portfolio), para valorar el alcance y la calidad del proyecto.

## 0.2 Alcance

**MyHomeGym** es una aplicación web instalable (PWA) para planificar y registrar entrenamientos de fuerza en un gimnasio en casa, y analizar la progresión.

| Dentro del alcance | Fuera del alcance |
| --- | --- |
| Rutinas, entrenos guiados y libres, series con kilos, repeticiones, tipo y RPE | Ejercicio cardiovascular con GPS, pulsómetros o wearables |
| Catálogo de 876 ejercicios y ejercicios propios | Vídeos de ejercicios, entrenador personal o IA que genere rutinas |
| Récords, 1RM estimado, volumen, rachas y mapa muscular | Nutrición, calorías o planes de dieta |
| Medidas corporales e IMC | Diagnóstico médico o recomendaciones de salud |
| Copias de seguridad JSON, CSV y PDF | Red social, seguidores o compartir dentro de la app |
| Español e inglés | Pagos, suscripciones o publicidad |

## 0.3 Referencias

| Referencia | Uso |
| --- | --- |
| ISO/IEC/IEEE 29148:2018, *Requirements engineering* | Estructura de la ERS y atributos de calidad de los requisitos |
| A. Durán y B. Bernárdez, *Metodología para la elicitación de requisitos de sistemas software* (Universidad de Sevilla) | Plantillas de objetivos, actores, casos de uso y requisitos de información |
| ISO/IEC 25010:2023, *Product quality model* | Clasificación de los requisitos no funcionales |
| Robertson y Robertson, *Volere Requirements Specification Template* | Criterios de ajuste (*fit criteria*) medibles |
| [FUNCIONALIDAD.md](../FUNCIONALIDAD.md) y [ARCHITECTURE.md](../ARCHITECTURE.md) | Descripción funcional y técnica del sistema implementado |

## 0.4 Convenciones

| Prefijo | Elemento | Fichero |
| --- | --- | --- |
| OBJ-nn | Objetivo del sistema | este fichero |
| ACT-nn | Actor | [08](08-actores-y-casos-de-uso.md) |
| CU-nn | Caso de uso | [08](08-actores-y-casos-de-uso.md), [09](09-casos-de-uso-detallados.md) |
| RI-nn | Requisito de información (qué datos guarda el sistema) | [10](10-requisitos-de-informacion.md) |
| FR-m.nn | Requisito funcional del módulo *m* | [01](01-cuenta-y-perfil.md) a [06](06-datos-y-configuracion.md) |
| RN-m.nn | Regla de negocio | [01](01-cuenta-y-perfil.md) a [06](06-datos-y-configuracion.md) |
| AC-m.n | Prueba de aceptación (*Dado / Cuando / Entonces*) | [01](01-cuenta-y-perfil.md) a [06](06-datos-y-configuracion.md) |
| RNF-m.nn | Requisito no funcional con criterio medible | [07](07-no-funcionales.md) |
| RES-nn, SUP-nn, EVO-nn | Restricción, supuesto, evolución prevista | [11](11-restricciones-y-supuestos.md) |

**Atributos de cada requisito** (se indican cuando aportan información):

- **Prioridad (MoSCoW):** *Must* (imprescindible), *Should* (importante), *Could* (deseable), *Won't* (descartado en esta versión).
- **Estado:** *Propuesto*, *Implementado* (está en el código) o *Verificado* (además lo comprueba un test automático o una prueba de aceptación ejecutada).
- **Estabilidad:** *Alta* (difícil que cambie), *Media* o *Baja* (es probable que cambie).
- **Fuente:** de dónde sale el requisito: *Autor* (decisión del autor), *Dominio* (práctica habitual del entrenamiento de fuerza), *Legal* o *Plataforma* (navegador, Android, Google Play).

Salvo que se indique otra cosa, todos los requisitos de los módulos 1 a 6 están **implementados**. Su prioridad figura en la tabla de cada módulo.

## 0.5 Contexto del problema

Quien entrena fuerza en casa suele apuntar sus series en una libreta, en notas del móvil o en apps generalistas. Esto plantea varios problemas:

1. **Durante el entreno**, con las manos ocupadas y el pulso alto, escribir es lento. No se ve de un vistazo qué se hizo la última vez.
2. **Progresar** exige recordar cuándo toca subir peso. Sin datos, se estanca o se sube demasiado pronto.
3. **El equilibrio muscular** (qué grupos se trabajan poco) no se ve en una lista de series.
4. **Los datos** quedan en una app de terceros, con publicidad o suscripción, y no se pueden exportar.

## 0.6 Interesados

| Interesado | Interés | Cómo participa |
| --- | --- | --- |
| Usuario que entrena en casa | Registrar rápido, progresar, ver su evolución | Fuente principal de requisitos funcionales y de usabilidad |
| Autor y mantenedor | Proyecto mantenible por una sola persona, valioso como portfolio | Decide el alcance, las restricciones y las prioridades |
| Contribuidor externo (si el proyecto se publica) | Entender el código y las reglas para proponer cambios | Lee esta ERS, `CONTRIBUTING.md` y, si usa IA, `AGENTS.md` |
| Evaluador académico o técnico | Ver un proceso de ingeniería completo | Revisa la ERS y la trazabilidad con los tests |

## 0.7 Objetivos del sistema

| Id | Objetivo | Descripción | Prioridad | Estabilidad |
| --- | --- | --- | --- | --- |
| OBJ-01 | Gestionar la cuenta y el perfil | El sistema deberá permitir a cada usuario tener una cuenta privada con sus datos personales básicos (peso, altura, IMC) y su evolución corporal. | Must | Alta |
| OBJ-02 | Planificar el entrenamiento | El sistema deberá permitir crear, organizar y reutilizar rutinas con sus ejercicios, series, repeticiones objetivo y descansos. | Must | Alta |
| OBJ-03 | Registrar entrenos con rapidez | El sistema deberá permitir registrar cada serie durante el entreno con el mínimo esfuerzo, enseñando lo que se hizo la última vez y controlando los descansos. | Must | Alta |
| OBJ-04 | Guiar la progresión | El sistema deberá indicar cuándo subir peso, detectar récords personales y estimar la fuerza máxima (1RM). | Should | Media |
| OBJ-05 | Analizar el progreso | El sistema deberá mostrar la evolución del volumen, la fuerza, las rachas, los récords, las medidas y el reparto del trabajo por músculos. | Should | Media |
| OBJ-06 | Ofrecer un catálogo de ejercicios | El sistema deberá ofrecer un catálogo amplio y traducido, con fotos e instrucciones, ampliable con ejercicios propios. | Must | Alta |
| OBJ-07 | Garantizar la propiedad y privacidad de los datos | El sistema deberá guardar los datos en infraestructura del propio usuario, aislarlos entre usuarios y permitir exportarlos, restaurarlos y borrarlos. | Must | Alta |
| OBJ-08 | Ser usable en el móvil y en dos idiomas | El sistema deberá poder usarse con una mano en un móvil, instalarse como app y funcionar en español e inglés. | Must | Media |

**Subobjetivos y relación con los casos de uso:** ver la matriz OBJ × CU en [13-trazabilidad.md](13-trazabilidad.md).
