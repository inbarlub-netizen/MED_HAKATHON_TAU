# Architecture

ClinFlight OS is a **client-only React app** with a deterministic engine layer. No backend, no API
keys. State flows through a single Zustand store that orchestrates pure engine functions.

## Data flow (one student turn)

```
Student UI (Cockpit)
   │  voice (Web Speech + mic metering) or typed fallback
   ▼
useVoiceCapture  ──►  transcript + audio duration
   │
   ▼
session.ask(text, durationSec)        [src/store/session.ts]
   │
   ├─► intentClassifier.classifyIntent(text)      → topics + tone + flags
   ├─► audioMetricsEngine.computeAudioMetrics()    → wpm, pauses, fillers (simulated if no audio)
   ├─► communicationEngine.evaluateCommunication() → trustΔ + presence subscores
   ├─► patientAgent.patientRespond()               → patient reply
   │        └─► hiddenConcernEngine.evaluateHiddenConcern()  (gating logic)
   ├─► coachEngine.coachAfterTurn()                → live coaching tip
   └─► replay events appended
   │
   ▼
store state: transcript, trust, presence, hiddenState, coveredTopics, flags, orderedMeasurements, replay
   │
   ▼
finish() ─► scoringEngine.scoreEncounter()  → OsceResult (7 domains + EPA + summary)
   │
   ▼
Debrief / Replay UI  ──►  Instructor Copilot  ──►  Faculty Insights
```

## Engine layer (`src/engine/`)

| Engine | Responsibility | Purity |
|---|---|---|
| `intentClassifier` | Regex topic + tone detection | pure |
| `communicationEngine` | Trust + presence deltas from intent | pure |
| `hiddenConcernEngine` | State machine: locked → clue → partial → revealed / guarded | pure |
| `patientAgent` | Persona-consistent reply, disclosure rules + hidden-concern priority | pure |
| `measurement` (in case data) | Indicated vs low-yield investigations | data |
| `audioMetricsEngine` | Delivery metrics from transcript/duration | pure |
| `scoringEngine` | 100-pt OSCE + EPA mapping + evidence | pure |
| `coachEngine` | Live, non-revealing coaching | pure |
| `facultyInsightsEngine` | Cohort → recommendations | pure |
| `instructorCopilotEngine` | Debrief guide generation | pure |
| `phiGuard` | Regex PHI detection (Rotation Companion) | pure |
| `llm/*` | Optional provider abstraction (off by default) | side-effect (guarded) |

**Why deterministic?** Demo reliability. Every engine is a pure function of `(case, state, input)`,
so the David case behaves identically every run, offline, with no API. An LLM can later replace
`patientAgent`/`coachEngine` outputs through the `LlmProvider` interface without changing the UI or
the scoring contract.

## Hidden Concern state machine

```
            on-topic + supportive + (confidentiality if required)
locked ───────────────────────────────────────────────► fully_revealed
  │                                                            ▲
  │ on-topic, neutral tone                                     │ follow-up
  ▼                                                            │
clue_given ──► partially_revealed ───────────────────────────►┘
  ▲
  │ judgmental / rushed tone  →  guardedResponse, stays locked
```

## State management

A single `useSession` Zustand store holds the live encounter and exposes actions (`start`, `ask`,
`order`, `submitReasoning`, `finish`, settings toggles). Pages subscribe to slices. Mock people /
cohort data are static TypeScript modules in `src/data/`.

## Rendering

- `App.tsx` routes; Landing is full-bleed, everything else is wrapped in `AppLayout` (cockpit
  sidebar + safety rail + animated transitions).
- Charts via Recharts; motion via Framer Motion; primitives via Radix.
