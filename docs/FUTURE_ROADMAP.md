# Future Roadmap

## Near term
- **Real speech-to-text** integration behind the existing voice hook (Whisper / cloud STT), with the
  typed fallback preserved.
- **LLM patient agent** via the `LlmProvider` interface — richer, persona-consistent dialogue while
  the deterministic engine remains the scoring source of truth.
- **Advanced prosody analysis** (pitch variation, real volume stability, talk-time ratio).

## Mid term
- **Voice-to-voice virtual patient** (STT → LLM → TTS) for fully spoken encounters.
- **Avatar / video patient** with expressions tied to emotional state.
- **Multilingual cases** — Hebrew, Arabic, English — including localized filler-word detection.
- **OSCE station mode** — timed, multi-station circuits with examiner view.
- **Instructor-authored case library** — promote the Case Builder preview to full authoring with
  validation and sharing.

## Long term
- **LMS / SIS integration** (Canvas, Moodle) and EPA portfolio export.
- **Real simulation-center deployment** — integrate with video debriefing systems and scheduling.
- **Accessibility calibration** — per-student baselines so fluency feedback is fair by design.
- **Faculty-reviewed assessment workflow** — formal override, sign-off, and audit trail for
  higher-stakes use.
- **De-identified clinical rotation learning logs** at scale, feeding the Learning Opportunity Router
  across an entire program.

## Research directions
- Validate the Hidden Concern Engine against standardized-patient checklists.
- Study whether normalizing-bridge coaching transfers to real bedside behavior.
- Measure instructor time saved per cohort using the debrief queue.
