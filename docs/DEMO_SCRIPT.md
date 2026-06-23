# Demo Script — click-by-click

**Total time: ~3 minutes.** The David case is the star; everything else supports the story.
Everything runs locally — no API key, no network needed.

> Tip: you can run the encounter entirely with the **guided demo buttons** in the Cockpit, so you
> never depend on the microphone during a live pitch.

---

## 0. Setup
- `npm install && npm run dev`, open the printed URL.
- Start on **Home**.

## 1. Landing (20s)
- Read the hero: *“Turn every clinical encounter — simulated or real-world — into a measurable
  learning opportunity.”*
- One line: *“Pilots train in flight simulators. Medical students deserve the same.”*
- Scroll past **the loop** and the **comparison** (most tools teach cases; we teach the learner).
- Click **Start Live Demo**.

## 2. Student Flight Deck (25s)
- “This is **Maya Cohen**, a 4th-year on Internal Medicine.”
- Point to the **System-detected weakness** card: medication adherence, hidden concerns,
  nonjudgmental social history, sensitive-question delivery.
- “The system recommends a case that targets exactly those gaps.”
- Click **Start Recommended Case** → Clinical Cockpit.

## 3. Clinical Cockpit — the encounter (70s)
- Orient: **left** = patient David (72, dizziness), **center** = voice-first encounter, **right** =
  live OSCE tracker + Patient Trust + Clinical Presence + Hidden Concern chip (currently **Locked**).
- Click starter prompt **“Hello David… what brings you in today?”** → David describes dizziness on
  standing. Trust ticks up (introduction).
- Click **“When did the dizziness start…”** and **“Any weakness, slurred speech, or fainting?”** →
  OSCE tracker checks **HPI** and **Red flags**.
- **The teaching moment — bad phrasing:** click the red **Bad phrasing** button
  (*“Are you taking your medications properly?”*).
  - David becomes **guarded**, the **Hidden Concern stays locked**, **Patient Trust drops**, and an
    amber **coaching tip** appears suggesting a normalizing bridge.
- **Better phrasing:** click the green **Better phrasing** button (normalizing bridge).
  - David: *“Actually yes… the blood pressure pill made me feel weak, so I stopped it about a week
    ago…”*
  - **Hidden Concern unlocks** (violet pulse), **Trust rises**, **Clinical Presence improves**, the
    **Hidden concern** row on the tracker flips to **unlocked**.
- In the **Exam / Vitals** tab, click **Order** on **Orthostatic vitals** (key, positive) and
  **Medication review**.
- Open the **Reasoning** tab → click **Prefill (demo)** → **Submit & Score**.

## 4. OSCE Debrief & Replay (40s)
- The **radial OSCE score** animates in with Trust / Presence / Communication badges.
- Scroll the **rubric**: each domain shows points, **evidence**, what was **missed**, and a
  **suggestion**. Highlight *Hidden concern discovery 15/15* and the *Communication* note about the
  early judgmental phrasing.
- Show the **EPA mapping** bars.
- **Replay timeline** (right): filter to **Communication** then **Hidden concerns** to walk:
  judgmental phrasing → patient guarded → normalizing bridge → **hidden concern unlocked** → test
  ordered → score impact.

## 5. Faculty Command (20s)
- Headline: **“62% of the cohort missed medication adherence in elderly dizziness.”**
- “Students know *what* to ask — they use **judgmental phrasing** for sensitive topics.”
- Point to the **skill heatmap** (med adherence + nonjudgmental phrasing in the red zone) and the
  **recommendations** (20-min micro-teaching; story-before-tests checkpoint).

## 6. Instructor Copilot (20s)
- Show the **debrief queue** (triaged) and **teaching-load balancing**.
- Show the **AI-generated debrief guide** for Maya: main issue, suggested opening, practice prompt,
  next-attempt goal, and acknowledged strengths.

## 7. Close (10s)
- *“ClinFlight OS does not replace instructors. It helps them know exactly where their time matters
  most.”*
- *“Clinical competence is not only knowing the right answer — it’s asking the right question, in the
  right way, at the right moment.”*

---

### Optional flourishes
- **Accessibility Mode** toggle (Cockpit right column or Safety page): fluency scoring off, content
  scoring stays.
- **Case Builder → Disclosure triggers**: type a judgmental vs. normalizing question and watch the
  hidden concern respond live.
- **Rotation Companion**: type a phone number into the note and watch **PHI Guard** flag it.
