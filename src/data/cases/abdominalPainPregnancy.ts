import type { ClinicalCase } from '@/types'

export const abdominalPainPregnancy: ClinicalCase = {
  id: 'abdominal-pain-pregnancy',
  title: 'Abdominal Pain - Hidden Pregnancy Concern',
  specialty: 'OB-GYN',
  secondarySpecialty: 'Emergency Medicine',
  difficulty: 'Advanced',
  simulatedMinutes: 13,
  summary:
    'A 19-year-old presents with abdominal pain. The hidden concern is a late period and fear of pregnancy, disclosed only with private, respectful menstrual/sexual history. Pregnancy test must precede CT.',
  learningObjectives: [
    'Take a private, respectful sexual/menstrual history',
    'Order pregnancy test before imaging',
    'Communicate sensitively',
  ],
  targetSkills: ['Privacy', 'Sexual history', 'Radiation safety', 'Sensitive communication'],
  patient: {
    name: 'Lina',
    age: 19,
    sex: 'female',
    chiefComplaint: 'Lower abdominal pain for two days',
    persona: 'embarrassed',
    personaLabel: 'Embarrassed, accompanied by a parent, wants privacy',
    healthLiteracy: 'moderate',
    recallReliability: 'high',
    baselineVitals: { bp: '118/72', hr: 92, rr: 16, temp: 37.1, o2: 99, pain: 5 },
    openingLine: 'My stomach has been hurting low down for a couple of days. My mum brought me in.',
  },
  disclosures: [
    { topics: ['onset_duration'], response: 'It started two days ago, lower on the right side.' },
    { topics: ['associated_symptoms'], response: 'A bit of nausea. No fever that I noticed.' },
  ],
  hiddenConcern: {
    id: 'pregnancy-fear',
    label: 'Late period and fear of pregnancy',
    description: 'Lina has a late period and is afraid she might be pregnant; she will only share this in private.',
    requiredTopic: 'pregnancy',
    requiresNonjudgmental: true,
    requiresConfidentiality: true,
    clueResponse: "Could we maybe talk... without my mum here?",
    guardedResponse: '(glances at her mother) Um, everything is normal, I think.',
    partialResponse: 'My period is a bit late... I\'m not sure what that means.',
    revealResponse:
      "Once we're alone - my period is two weeks late and I'm scared I might be pregnant. Please don't tell my mum yet.",
  },
  measurements: [
    { id: 'upreg', label: 'Urine pregnancy test', category: 'lab', result: 'POSITIVE.', interpretation: 'key', indicated: true },
    { id: 'vitals', label: 'Vitals', category: 'vitals', result: 'HR 92, BP 118/72.', interpretation: 'info', indicated: true },
    { id: 'us', label: 'Pelvic ultrasound', category: 'imaging', result: 'Intrauterine pregnancy, ~6 weeks.', interpretation: 'key', indicated: true },
    { id: 'ct', label: 'CT abdomen', category: 'imaging', result: 'Avoid before pregnancy test - radiation risk.', interpretation: 'abnormal', indicated: false },
  ],
  expectedDifferential: ['Ectopic pregnancy (cannot-miss)', 'Early intrauterine pregnancy', 'Appendicitis'],
  cannotMiss: 'Ectopic pregnancy',
  expectedPlan: ['Pregnancy test first', 'Pelvic ultrasound', 'Avoid CT until pregnancy excluded', 'Private, supportive counseling'],
  status: 'preview',
}
