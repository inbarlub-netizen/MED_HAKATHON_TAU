/** Product mockups from the ClinFlight brand pack, placed to tell one story. */
export interface ProductScreenshot {
  src: string
  title: string
  badge: string
  description: string
}

const base = '/images/clinflight/screens'

export const heroShot = `${base}/01_landing_hero_overview.png`

export const productScreenshots: ProductScreenshot[] = [
  {
    src: `${base}/02_student_flight_deck.png`,
    title: 'Student Flight Deck',
    badge: 'Student View',
    description: 'Personalized progress, weak-skill detection, and the recommended next case.',
  },
  {
    src: `${base}/03_clinical_cockpit.png`,
    title: 'Clinical Cockpit',
    badge: 'Simulation View',
    description: 'Voice-first encounter with patient trust, clinical presence, and hidden-concern tracking.',
  },
  {
    src: `${base}/04_osce_replay_debrief.png`,
    title: 'OSCE Replay & Debrief',
    badge: 'Replay View',
    description: 'Timeline-based replay with evidence, coaching, and score impact.',
  },
  {
    src: `${base}/05_faculty_command_dashboard.png`,
    title: 'Faculty Command',
    badge: 'Faculty View',
    description: 'Cohort analytics, curriculum gaps, and teaching recommendations.',
  },
  {
    src: `${base}/06_instructor_copilot.png`,
    title: 'Instructor Copilot',
    badge: 'Instructor View',
    description: 'Debrief queue, suggested feedback, and where instructor time matters most.',
  },
  {
    src: `${base}/07_case_builder_preview.png`,
    title: 'Case Builder',
    badge: 'Educator Tool',
    description: 'Author specialty-specific cases with hidden concerns and OSCE rubrics.',
  },
]

export const shot = (i: number) => productScreenshots[i]
