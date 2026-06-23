# ClinFlight OS - Project Context for Claude

This folder is the ClinFlight OS project (TAU Helmsley medical-simulation hackathon).
It is a standalone project and is NOT related to the e:/uni statistics coursework.

## Read first
- `HANDOFF.md` (repo root) has the full context: what is built, every decision, deploy
  info, voice regeneration, and the team-meeting roadmap. Read it before starting work.
- `docs/` has the product spec, architecture, demo script, rubric, safety, and source audit.

## What this is
Voice-first clinical teaching simulation. Live: https://clinflight-os-tau.netlify.app
A student practices a patient encounter, the system scores communication and uncovers a
hidden concern, then produces OSCE replay feedback, an instructor debrief, and faculty
cohort analytics. The spine is the David case (Elderly Dizziness, Medication Non-Adherence).

Stack: Vite + React 18 + TypeScript + Tailwind + Radix + Recharts + Framer Motion + Zustand.
No backend, no API keys. Deterministic engines in `src/engine`, orchestrated by
`src/store/session.ts`.

## Run
```
npm install
npm run dev        # http://localhost:5173
npm run build
```
If `npm install` fails with a TLS error on a proxy network, run
`npm config set strict-ssl false` then retry (not needed on a normal network).

## Deploy (Netlify, already linked to site clinflight-os-tau)
```
npm run build && netlify deploy --prod --dir=dist
```

## Voices
Kokoro TTS via the `kokoro-js` package, pre-rendered to `public/audio`. Maya = af_heart,
David = bm_george. Regenerate after changing scripted lines:
```
node scripts/render-voices.mjs     # needs ffmpeg; first run downloads the model
```

## GitHub
Private repo: https://github.com/omerkonkol/clinflight-os

## Conventions
- No em-dashes in copy. Use regular hyphens.
- Keep the UI premium: dark clinical cockpit, glassmorphism, cyan/violet accents,
  rounded panels, smooth Framer Motion animations.
- The Presenter Mode and auto-play scenarios are the reliable demo path (no mic needed).
