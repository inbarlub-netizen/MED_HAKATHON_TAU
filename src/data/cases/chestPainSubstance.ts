import type { ClinicalCase } from '@/types'

export const chestPainSubstance: ClinicalCase = {
  id: 'chest-pain-substance',
  title: 'Chest Pain - Hidden Substance Use',
  specialty: 'Emergency Medicine',
  secondarySpecialty: 'Internal Medicine',
  difficulty: 'Advanced',
  simulatedMinutes: 14,
  summary:
    'A 24-year-old presents with chest pain. The hidden concern is recreational cocaine use last night, disclosed only with a confidential, nonjudgmental substance-use history.',
  learningObjectives: [
    'Risk-stratify young chest pain',
    'Take a confidential nonjudgmental substance history',
    'Order ECG/troponin appropriately',
  ],
  targetSkills: ['Substance use history', 'Confidentiality', 'Red flags', 'Cannot-miss reasoning'],
  patient: {
    name: 'Ethan',
    age: 24,
    sex: 'male',
    chiefComplaint: 'Sharp central chest pain since this morning',
    persona: 'guarded',
    personaLabel: 'Guarded, worried about being judged',
    healthLiteracy: 'high',
    recallReliability: 'high',
    baselineVitals: { bp: '152/94', hr: 104, rr: 18, temp: 37.0, o2: 98, pain: 6 },
    openingLine: "My chest has been tight and racing since this morning. I'm a bit freaked out, honestly.",
  },
  disclosures: [
    { topics: ['onset_duration'], response: 'It started a few hours ago, came on at rest.' },
    { topics: ['associated_symptoms'], response: 'My heart is pounding and I feel sweaty.' },
  ],
  hiddenConcern: {
    id: 'cocaine-use',
    label: 'Recreational cocaine use last night',
    description: 'Ethan used cocaine at a party last night and fears judgment or legal trouble.',
    requiredTopic: 'substance_use',
    requiresNonjudgmental: true,
    requiresConfidentiality: true,
    clueResponse: 'I was out late at a party last night... it was a big night.',
    guardedResponse: "I'm not a drug addict if that's what you're asking. (crosses arms)",
    partialResponse: 'I might have taken something at the party... I\'d rather not get into it.',
    revealResponse:
      'Okay... since this stays between us - I did a couple of lines of cocaine last night. That\'s never happened with my chest before.',
  },
  measurements: [
    { id: 'ecg', label: 'ECG', category: 'exam', result: 'Sinus tachycardia, no STEMI.', interpretation: 'abnormal', indicated: true },
    { id: 'trop', label: 'Troponin', category: 'lab', result: 'Mildly elevated.', interpretation: 'key', indicated: true },
    { id: 'cxr', label: 'Chest X-ray', category: 'imaging', result: 'No pneumothorax or widened mediastinum.', interpretation: 'normal', indicated: true },
    { id: 'vitals', label: 'Repeat vitals', category: 'vitals', result: 'HR 104, BP 152/94.', interpretation: 'info', indicated: true },
  ],
  expectedDifferential: ['Cocaine-associated chest pain / ACS', 'Anxiety', 'Aortic pathology (cannot-miss)'],
  cannotMiss: 'Acute coronary syndrome / aortic dissection',
  expectedPlan: ['ECG + troponin', 'Avoid beta-blocker monotherapy', 'Benzodiazepine + supportive care', 'Confidential counseling'],
  status: 'preview',
}
