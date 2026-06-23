# ClinFlight OS - Handoff & Full Context

> Read this first. It captures everything built so far, every decision, the environment
> quirks, the live deploy, and the roadmap from the team meeting. On a new machine:
> clone this repo, run it, and tell Claude "read HANDOFF.md" to be fully caught up.

## What this is
ClinFlight OS - a "Clinical Teaching Operating System" for the TAU Helmsley Medical
Simulation hackathon (Synergy Innovate, partnered with Base44). A voice-first clinical
simulation where a student practices a patient encounter, the system scores communication
and uncovers a hidden concern, then produces OSCE replay feedback, an instructor debrief,
and faculty cohort analytics.

- Live site: https://clinflight-os-tau.netlify.app
- Netlify project: clinflight-os-tau (deployed under Netlify account omerkonkol@mail.tau.ac.il)
- Stack: Vite + React 18 + TypeScript + Tailwind + Radix UI + Recharts + Framer Motion + Zustand
- No backend, no API keys. All logic is deterministic engines run locally. Works offline.

## Run it (on the laptop)
```bash
# needs Node 18+ (this machine used Node 22)
npm install
npm run dev          # opens http://localhost:5173
npm run build        # production build into dist/
```
If npm install fails with a TLS / UNABLE_TO_VERIFY_LEAF_SIGNATURE error (corporate/proxy
network), run: `npm config set strict-ssl false` then retry. On a normal home network this
is not needed (and you can keep strict-ssl true).

## Deploy (Netlify, already set up)
```bash
npm run build
netlify deploy --prod --dir=dist        # site is already linked (.netlify/ is gitignored)
```
The Netlify CLI is logged in as omerkonkol. If on a new laptop, run `netlify login` and
`netlify link` to the clinflight-os-tau site, or just use Netlify Drop with the dist folder.

---

## The demo story (this is the spine of the whole product)
Maya Cohen, a 4th-year student, is detected to struggle with medication adherence, hidden
concerns, and sensitive-question delivery. The system recommends the case
"Elderly Dizziness - Medication Non-Adherence". She enters the Clinical Cockpit and talks
with David, 72. A judgmental question ("Are you taking your medications properly?") makes
David guarded and the hidden concern stays locked. A nonjudgmental, normalizing question
unlocks it: David stopped his blood-pressure medication due to side effects. The OSCE Replay
shows the decisive moments, the Instructor Copilot generates a debrief guide, and the Faculty
Dashboard shows 62% of the cohort missed this - a teaching gap.

Core message: "Clinical teaching does not scale. ClinFlight OS makes it measurable,
repeatable, and instructor-guided." Secondary: "It does not replace instructors. It helps
them know exactly where their time matters most."

---

## What is built (all working + deployed)

### Pages / routes
- Landing (`/`) - guided product-demo story: problem-first hero, simplified navbar
  (Overview, Live Demo, Clinical Cockpit, Replay, Faculty, Safety + Run Demo), 5-step
  teaching loop, "Watch the learning moment happen" with weak vs better phrasing cards,
  Replay / Instructor / Faculty / Hospital-value / Safety sections, all using the real
  product screenshots from the brand pack.
- Student Flight Deck (`/flight-deck`) - Maya's profile, detected weakness, recommended case.
- Clinical Cockpit (`/cockpit`) - the main simulation (see below).
- OSCE Debrief / Replay (`/debrief`) - score, rubric with evidence, EPA mapping, filterable
  replay timeline.
- My Progress (`/progress`), Faculty Command (`/faculty`), Instructor Copilot (`/instructor`),
  Case Builder preview (`/builder`), Rotation Companion preview (`/rotation`),
  Safety/Settings (`/safety`).

### Clinical Cockpit features
- Voice-first encounter: mic (Web Speech API) with a typed fallback that always works.
- Presenter Mode: a row of numbered one-click scripted buttons (Ask opening / Ask weak
  medication question / Ask improved nonjudgmental question / Order orthostatic vitals /
  Submit differential & plan / Open OSCE Replay / Open Faculty Insight). No mic or typing
  needed - this is the reliable way to demo.
- Three auto-play scenarios (Exemplary / Struggling / Recovery) that play a full two-person
  conversation through the real engine.
- Real human voices (see Voices below): Maya (clinician) and David (patient), two distinct
  voices, played in sync with the transcript. A "David is typing..." beat between turns.
- Live AI Conversation Analysis panel: per turn shows detected intent, tone, trust delta,
  and hidden-concern transitions, with animations.
- Patient panel with vitals, persona, emotional state, and a very visible hidden-concern
  state (Locked / Clue given / Unlocked) plus contextual messages.
- Goal mini-brief, OSCE progress tracker, measurement ordering (vitals/exam/labs/imaging),
  clinical reasoning submission.
- Animated end-of-encounter debrief modal (score ring, strengths, how-to-improve, EPA bars)
  that pops up when a scenario or submission finishes.

### Engines (deterministic, in `src/engine/`)
intentClassifier, communicationEngine, patientAgent, hiddenConcernEngine, measurement (in
case data), audioMetricsEngine, scoringEngine (100-pt / 7-domain OSCE + EPA), coachEngine,
replayEngine (events built in the store), facultyInsightsEngine, instructorCopilotEngine,
phiGuard, and an optional LLM provider abstraction (mock + OpenAI-compatible, off by default).
The Zustand store `src/store/session.ts` orchestrates everything (askStudent / flushPatient /
order / submitReasoning / finish, with a two-phase reveal for conversation pacing).

### Cases (`src/data/cases/`)
- elderlyDizzinessAdherence (David) - the live, fully-implemented case.
- chestPainSubstance (Ethan), abdominalPainPregnancy (Lina), copdLowHealthLiteracy (Miriam) -
  preview cases with full data, not yet wired into the cockpit.

### Brand
Real logo (app icon + wordmark) and 7 product screenshots from the team's brand pack live in
`public/images/clinflight/`. The app icon is the favicon and the in-app logo. The landing
uses the screenshots as an animated product tour.

---

## Voices (important, and how to regenerate)
- Engine: Kokoro TTS (open-source, Apache-2.0, runs locally via the `kokoro-js` npm package).
  Chosen after a "free ElevenLabs alternative" search. No API key, no cost.
- Voices: Maya = `af_heart` (warm female), David = `bm_george` (mature British male).
- 40 lines are pre-rendered to MP3 in `public/audio/<id>.mp3`. Matching is by a normalized
  hash of the line text (see `src/lib/voice.ts` and `scripts/render-voices.mjs` - the hash
  functions MUST stay identical between the two).
- To regenerate (e.g. after changing a scripted line or adding a case):
  ```bash
  # ffmpeg must be installed (used to convert wav -> mp3)
  node scripts/render-voices.mjs        # writes public/audio/*.mp3 + src/data/voiceManifest.json
  ```
  First run downloads the ~80MB Kokoro model from HuggingFace. On a proxy network set
  `NODE_TLS_REJECT_UNAUTHORIZED=0` for that command only.

---

## Environment quirks seen on the original machine (E:\ drive, Windows)
- Corporate TLS-intercepting proxy broke npm/cloudflared/HuggingFace SSL. Workarounds used:
  `npm config set strict-ssl false` and `NODE_TLS_REJECT_UNAUTHORIZED=0` per-command. On a
  normal network these are not needed - prefer leaving SSL verification ON.
- Python 3.14 is installed; faster-whisper works there for speech-to-text (used to transcribe
  a team voice note - see docs/team_meeting_transcript_2026-06-21.txt).

---

## Roadmap from the team meeting (2026-06-21) - what to add next
Full transcript: `docs/team_meeting_transcript_2026-06-21.txt`. Key decisions and ideas:
1. Focus on TWO departments for the demo: Emergency Medicine (מיון) + Internal Medicine
   (פנימית). (Pediatrics + Internal was the alternative.)
2. NEW signature feature - "Present the patient to your supervisor": after the history, the
   student gives an oral case presentation; the system checks whether it matches the info
   actually gathered in the simulation, and the supervisor sees a side-by-side accuracy view.
3. Department-specific history checklists / emphases (Moodle-style): each department defines
   its required items; the system flags what the student missed (especially when the
   attending is not in the room) and then they present when the attending arrives.
4. One platform for both learner and instructor (already have faculty/instructor views).
5. Make it less "chatbot": patient avatar, gamification (progress per department, score,
   leaderboard), and record/replay realism ("you behave better when filmed").
6. Pitch video: create a cinematic AI-generated demo video from a script. Need one specific
   Internal case and one specific ER case with patient details + the assessment criteria.
7. Logistics: hackathon starts Wednesday. Partnered with Base44 (50 credits each) - decide
   whether to present this React/Netlify site or rebuild/wrap in Base44.

Suggested next build order: (a) one full ER case wired into the cockpit, (b) the
"Present the patient" mode, (c) department selector + per-department checklists.

---

## Chronological log of what was requested and done (this chat)
1. Built the full ClinFlight OS MVP (all pages, engines, the David case, docs).
2. Used a strong UI foundation (Radix/shadcn-style + Recharts + Framer Motion), not from scratch.
3. Performance pass: route code-splitting, vendor chunking, removed heavy backdrop-blur.
4. Deployed to Netlify (clinflight-os-tau).
5. Added auto-play demo scenarios (Exemplary / Struggling / Recovery) through the real engine.
6. Added patient voice; iterated from edge-tts to Kokoro for a natural human voice; made it a
   two-person conversation (Maya + David); fixed transcript/voice sync (two-phase reveal,
   typing indicator, await audio).
7. Integrated the team brand pack (logo + 7 screenshots); fixed the boxy logo to a crisp lockup.
8. Removed all em-dashes from copy (user preference: looks AI-generated).
9. Major site audit: turned the landing into a guided demo story; added Presenter Mode and
   cockpit self-explanation (goal brief, hidden-concern messages); added animated end debrief.
10. Fixed scenario "skipping" and the stuck start button (single shared lock + try/finally
    cleanup; resilient reading-time pacing).
11. Transcribed the team voice note (faster-whisper) and summarized the roadmap (above).
12. Pushed to GitHub (this repo) for portability to the hackathon laptop.

## Open TODO / nice-to-haves
- Wire an ER case into the cockpit (chestPainSubstance is a starting point).
- "Present the patient to your supervisor" mode.
- Department selector + per-department checklists.
- Optionally render voices for the other 3 cases (distinct voice per patient).
- Decide Base44 vs this site for the hackathon submission.
- (Housekeeping) consider setting `npm config set strict-ssl true` again on a normal network.
