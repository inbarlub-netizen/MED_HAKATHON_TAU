# Safety & Privacy

**ClinFlight OS is for medical education and simulation only. It uses synthetic educational cases. It
does not diagnose real patients and does not provide real clinical decision support.**

## Scope guarantees
- Synthetic, original cases only — no copyrighted or real patient cases.
- No real diagnosis or treatment recommendations.
- AI feedback is **formative**, never final grading.
- High-stakes assessment requires **faculty review and override** (surfaced in the UI).
- No identifiable patient data is stored.
- Supportive language toward both students and instructors.

## Voice fairness
Voice/delivery analytics are **formative only** and must never penalize who a person is.

- **Accessibility Mode** disables fluency scoring, keeps clinical-content and communication-structure
  feedback, marks voice analytics as formative, and flags for faculty review.
- Fluency scoring can be disabled independently.
- We do **not** penalize accents, stutters, speech disabilities, or non-native speakers.
- All voice feedback uses coaching language.

| We say | We never say |
|---|---|
| “Delivery coaching opportunity.” | “Student lacks confidence.” |
| “Consider a clearer transition before sensitive questions.” | “Poor speaker.” |
| “Long pause before the medication-adherence question.” | “Bad communication.” |
| “Your explanation helped patient trust.” | “You sounded bad.” |

## PHI Guard
The Rotation Companion connects real rotations to simulation **without** identifiers. A regex-based
PHI Guard flags names patterns, phone numbers, IDs/MRNs, emails, and exact dates before anything is
saved. Rotation learning is de-identified to **age bands** and **case types** only. (Demo-grade
detection — production would use a vetted de-identification service.)

## Instructor analytics framing
Instructor and faculty analytics are **support tools, not surveillance**:
- Faculty Support Analytics
- Teaching Load Balancing
- Debrief Support
- “Where instructor time is most needed”

## Data handling (this MVP)
- Runs entirely in the browser. No backend, no telemetry, no API keys.
- Session state lives in memory only and is cleared on reset.
- The optional LLM provider is **off by default**; if enabled, prompts contain only synthetic case
  text, and outputs are JSON-validated with safe fallbacks.

## Limitations
- Deterministic rule-based logic tuned for the demo cases — not a general medical model.
- Browser speech recognition is best-effort; the typed fallback always works.
- Mock cohort/instructor data in the P1 dashboards.
- Not a certified assessment instrument.
