# Product Spec

## One-liner
ClinFlight OS turns every clinical encounter — simulated or real-world — into a measurable learning
opportunity.

## Problem
Medical school enrollment grows faster than teaching capacity. Instructors, patient access, teaching
time, and simulation facilities are limited, producing unequal practice and thin feedback.

## Users
- **Student** (Maya Cohen) — practices, gets formative feedback, tracks competence.
- **Instructor / clinician-educator** — gets focused debrief guides and load balancing.
- **Program director / sim center** — sees cohort gaps and curriculum recommendations.

## The closed teaching loop
1. Detect a student’s weak clinical skills.
2. Recommend a personalized case.
3. Practice with a voice-first virtual patient.
4. Hidden information unlocks only with the right question, tone, and timing.
5. Order vitals/exam/labs/imaging.
6. Submit differential + management.
7. OSCE-style feedback with evidence.
8. Replay the decisive moments.
9. Instructor debrief guide.
10. Faculty cohort analytics.
11. Recommend next steps for student, instructor, and sim center.

## Differentiation
Most tools teach **cases**. ClinFlight OS teaches the **learner**, supports the **instructor**, and
improves the **curriculum** — combining realistic simulation, real voice practice, hidden-concern
discovery, longitudinal tracking, instructor support, faculty analytics, case authoring, and rotation
learning in one adaptive loop.

## Scope (this MVP)
**P0 (fully working):** Landing, Flight Deck, Clinical Cockpit, the David case end-to-end, voice-first
UI + typed fallback, Hidden Concern Engine, Patient Trust, Clinical Presence, measurement panel,
reasoning submission, OSCE scoring, Debrief, Replay, coaching.

**P1 (visually complete, mock data):** Faculty Dashboard, Instructor Copilot, Progress profile,
cohort analytics, debrief queue, teaching recommendations.

**P2 (preview):** Case Builder, Rotation Companion, Learning Opportunity Router, PHI Guard, LLM
abstraction, additional specialty templates.

## Primary demo case
**Elderly Dizziness — Medication Non-Adherence.** Patient David, 72. Hidden concern: he stopped his
antihypertensive due to side effects and told no one. Teaching moment: eliciting medication adherence
nonjudgmentally. Three more cases (hidden substance use, hidden pregnancy concern, COPD literacy/cost)
ship as selectable previews.

## Specialty case-type framework
Internal Medicine and Geriatrics are implemented via the David case; Emergency, OB-GYN, Pulmonology,
Pediatrics, and Psychiatry ship as templates shown on the Landing page and Case Builder.

## Non-goals
Not a chatbot, not a quiz app, not a generic dashboard, not a logbook, not a real clinical
decision-support tool.

## Acceptance criteria
See the checklist in the root brief — all P0 items work end-to-end on the David case; P1 dashboards
render with mock data; safety, accessibility, and PHI features are represented; docs and both READMEs
exist; `npm install && npm run dev` runs with no console errors on the main path.
