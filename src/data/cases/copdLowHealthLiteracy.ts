import type { ClinicalCase } from '@/types'

export const copdLowHealthLiteracy: ClinicalCase = {
  id: 'copd-low-health-literacy',
  title: 'COPD Dyspnea - Low Health Literacy & Cost Barrier',
  specialty: 'Pulmonology',
  secondarySpecialty: 'Internal Medicine',
  difficulty: 'Intermediate',
  simulatedMinutes: 12,
  summary:
    'A 58-year-old with COPD presents with worsening breathlessness. The hidden concern is that she confuses her inhalers and cannot afford the maintenance inhaler - disclosed through teach-back and a respectful affordability question.',
  learningObjectives: ['Use teach-back', 'Check inhaler technique', 'Ask about affordability respectfully'],
  targetSkills: ['Health literacy', 'Teach-back', 'Affordability', 'Inhaler technique'],
  patient: {
    name: 'Miriam',
    age: 58,
    sex: 'female',
    chiefComplaint: 'Getting more short of breath over two weeks',
    persona: 'low-health-literacy',
    personaLabel: 'Low health literacy, embarrassed about cost and confusion',
    healthLiteracy: 'low',
    recallReliability: 'moderate',
    baselineVitals: { bp: '134/80', hr: 92, rr: 22, temp: 36.9, o2: 92, pain: 0 },
    openingLine: "I just can't catch my breath like I used to. The puffers don't seem to help much.",
  },
  disclosures: [
    { topics: ['onset_duration'], response: 'The last couple of weeks it\'s gotten worse.' },
    { topics: ['medications'], response: 'I have two puffers, a blue one and a brown one. I get them mixed up.' },
  ],
  hiddenConcern: {
    id: 'inhaler-cost',
    label: 'Inhaler confusion and cost barrier',
    description: 'Miriam confuses her reliever and preventer inhalers and cannot afford the maintenance inhaler.',
    requiredTopic: 'medication_adherence',
    requiresNonjudgmental: true,
    clueResponse: 'I use the blue one a lot... the brown one I save, it\'s the expensive one.',
    guardedResponse: 'I take them, I suppose. (looks down)',
    partialResponse: 'The brown inhaler is dear, so I don\'t always fill it.',
    revealResponse:
      'The truth is, I can\'t really afford the brown one every month, so I skip it, and I never know which puffer does what.',
  },
  measurements: [
    { id: 'o2', label: 'O2 saturation', category: 'vitals', result: 'SpO2 92% on room air.', interpretation: 'abnormal', indicated: true },
    { id: 'lung', label: 'Lung exam', category: 'exam', result: 'Prolonged expiration, mild wheeze.', interpretation: 'abnormal', indicated: true },
    { id: 'technique', label: 'Inhaler technique check', category: 'exam', result: 'Poor coordination, no spacer.', interpretation: 'key', indicated: true },
    { id: 'cxr', label: 'Chest X-ray', category: 'imaging', result: 'Hyperinflation, no consolidation.', interpretation: 'normal', indicated: true },
  ],
  expectedDifferential: ['COPD exacerbation', 'Poor inhaler technique/adherence', 'Heart failure'],
  cannotMiss: 'Respiratory failure',
  expectedPlan: ['Teach-back on inhaler use', 'Provide spacer', 'Address affordability / cheaper regimen', 'Follow-up and safety-net'],
  status: 'preview',
}
