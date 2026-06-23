# ClinFlight OS — Clinical Teaching Operating System

> Turn every clinical encounter — simulated or real-world — into a measurable learning opportunity.

Built for the **Synergy Innovate / TAU Helmsley Medical Simulation Center** challenge:
_“Scaling Clinical Teaching: The Future of Medical Education.”_

ClinFlight OS is a clinical-reasoning **flight simulator** and a teaching **command center**.
Students practice realistic voice-first encounters, instructors get targeted debrief support,
and program directors see learning gaps across the whole cohort.

> **Most tools teach cases. ClinFlight OS teaches the learner, supports the instructor, and improves the curriculum.**

---

## ⚠️ Safety & scope

**For medical education and simulation only. Synthetic cases. Not for real patient diagnosis or
treatment.** AI feedback is **formative** and requires faculty review for high-stakes assessment.
See [`docs/SAFETY_AND_PRIVACY.md`](docs/SAFETY_AND_PRIVACY.md).

---

## Run it

```bash
npm install
npm run dev
```

No API keys are required. The entire demo runs on **deterministic local logic** for reliability.
An optional LLM provider abstraction exists (`src/engine/llm/`) but is **off by default**.

- Requires Node 18+
- Open the printed `localhost` URL (Vite default `http://localhost:5173`)

Build for production:

```bash
npm run build && npm run preview
```

---

## The 60-second demo

1. **Home** — the pitch and the closed teaching loop.
2. **Student Flight Deck** — meet **Maya Cohen** (4th year). The system detected she struggles with
   medication adherence, hidden concerns, and sensitive-question delivery. Click **Start Recommended
   Case**.
3. **Clinical Cockpit** — the live case: **Elderly Dizziness — Medication Non-Adherence** (patient
   **David, 72**).
   - Ask basic history (voice or typed).
   - Click the **Bad phrasing** demo button → _“Are you taking your medications properly?”_ →
     David becomes guarded, the **Hidden Concern stays locked**, **Patient Trust drops**, and a
     coaching tip appears.
   - Click the **Better phrasing** button (normalizing bridge) → David reveals he **stopped his
     blood-pressure pill** → **Hidden Concern unlocks**, **Trust rises**, **Clinical Presence
     improves**.
   - Order **orthostatic vitals** + **medication review**, open the **Reasoning** tab, hit
     **Prefill (demo)**, then **Submit & Score**.
4. **OSCE Debrief / Replay** — radial OSCE score, evidence-linked rubric, EPA mapping, and a
   filterable **replay timeline**: missed opportunity → weak phrasing → better phrasing → hidden
   concern unlock → test ordered → score impact.
5. **Faculty Command** — _“62% of the cohort missed medication adherence.”_ Students know what to
   ask, but use judgmental phrasing for sensitive topics.
6. **Instructor Copilot** — an AI-generated debrief guide and a recommended 20-minute micro-teaching.

Full click-by-click script: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md).

---

## Why it’s not just a chatbot

| Layer | What it does |
|---|---|
| **Hidden Concern Engine** | Sensitive information unlocks only with the right topic, the right tone, at the right moment |
| **Communication Engine** | Scores _how_ the student speaks → Patient Trust + Clinical Presence |
| **Intent Classifier** | Rule-based topic + tone detection (judgmental / normalizing / empathic) |
| **Scoring Engine** | 100-point, 7-domain OSCE rubric with evidence + EPA mapping |
| **Replay Engine** | Reconstructs the decisive moments of the encounter |
| **Faculty / Instructor Insights** | Cohort gaps, debrief guides, teaching-load balancing |

---

## Tech stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** with a custom clinical-cockpit design system
- **Radix UI** primitives + **lucide-react** (the shadcn/ui foundation, styled to theme)
- **Recharts** for analytics, **Framer Motion** for motion
- **Zustand** for session state
- Local TypeScript mock data — **no backend, no API keys**

Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Project layout

```
src/
  engine/        deterministic engines (intent, patient, hidden concern, scoring, replay…)
  store/         zustand session orchestrator
  data/          cases (David + 3 previews), students, instructors, cohorts, rubric
  components/    ui kit (Radix-based) + shared score visuals + layout
  pages/         Landing, FlightDeck, Cockpit, Debrief, Faculty, Instructor, Progress, …
  hooks/         useVoiceCapture (Web Speech + live mic metering, typed fallback)
  types/         domain types
docs/            spec, demo + pitch scripts, rubric, safety, source audit, roadmap
```

---

## Limitations (honest)

- Patient responses and scoring are **deterministic rule-based logic**, tuned for the David case —
  not a general medical model.
- Voice recognition uses the browser **Web Speech API** when available; otherwise the **typed
  fallback always works** and audio metrics are clearly labeled _simulated_.
- Cohort, instructor, and progress data are **mock** for the P1 dashboards.
- This is a hackathon MVP, not a certified assessment tool.

---

## Documentation index

- [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/EDUCATIONAL_RUBRIC.md`](docs/EDUCATIONAL_RUBRIC.md)
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)
- [`docs/PITCH_SCRIPT.md`](docs/PITCH_SCRIPT.md)
- [`docs/SAFETY_AND_PRIVACY.md`](docs/SAFETY_AND_PRIVACY.md)
- [`docs/SOURCE_AUDIT.md`](docs/SOURCE_AUDIT.md)
- [`docs/FUTURE_ROADMAP.md`](docs/FUTURE_ROADMAP.md)
- [`README_HE.md`](README_HE.md) — Hebrew overview

---

_ClinFlight OS does not replace instructors. It helps them know exactly where their time matters most._
