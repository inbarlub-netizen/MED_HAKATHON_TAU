import type { ClinicalCase } from '@/types'

/**
 * MAIN LIVE DEMO CASE
 * Elderly Dizziness - Medication Non-Adherence
 * Patient David, 72, stopped his antihypertensive due to side effects and hid it.
 */
export const elderlyDizzinessAdherence: ClinicalCase = {
  id: 'elderly-dizziness-adherence',
  title: 'Elderly Dizziness - Medication Non-Adherence',
  specialty: 'Geriatrics',
  secondarySpecialty: 'Internal Medicine',
  difficulty: 'Intermediate',
  simulatedMinutes: 12,
  summary:
    'A 72-year-old man presents with dizziness and near falls. The key teaching moment is eliciting a hidden, sensitive history of medication non-adherence through nonjudgmental, structured communication.',
  learningObjectives: [
    'Take a focused dizziness/falls history',
    'Elicit medication adherence nonjudgmentally',
    'Screen orthostatic and cardiac red flags',
    'Build a prioritized differential and safe plan',
  ],
  targetSkills: [
    'Medication adherence',
    'Hidden concerns',
    'Nonjudgmental social history',
    'Structured delivery before sensitive questions',
  ],
  patient: {
    name: 'David',
    age: 72,
    sex: 'male',
    chiefComplaint: 'Dizziness and near falls for the past week',
    persona: 'confused-elderly',
    personaLabel: 'Polite, slightly confused, does not want to disappoint the doctor',
    healthLiteracy: 'moderate',
    recallReliability: 'moderate',
    baselineVitals: { bp: '148/86', hr: 82, rr: 16, temp: 36.7, o2: 97, pain: 1 },
    openingLine:
      "Hello doctor. I've been feeling dizzy on and off this past week, especially when I stand up. I nearly fell twice. I don't want to be a bother.",
  },
  disclosures: [
    {
      topics: ['onset_duration'],
      response:
        "It started about a week ago. It comes mostly when I get up from the chair or out of bed - a few seconds of the room spinning, then it settles.",
    },
    {
      topics: ['associated_symptoms'],
      response:
        "No chest pain really. Maybe my heart feels a little fast sometimes when I stand. No fainting, but I had to grab the table twice.",
    },
    {
      topics: ['red_flags'],
      response:
        "No weakness in my arms or legs, my speech is fine, no bad headache. I just feel unsteady when I stand up.",
    },
    {
      topics: ['symptom_history'],
      response:
        "It's a lightheaded, unsteady feeling - not really the room spinning around me. Worse in the mornings.",
    },
    {
      topics: ['medications'],
      response:
        "I take a pill for blood pressure... and something for my cholesterol. My wife usually sorts them out for me.",
    },
    {
      topics: ['allergies'],
      response: 'No allergies that I know of.',
    },
    {
      topics: ['social_history'],
      response:
        "I live with my wife. I don't smoke. Maybe a glass of wine on Friday. I still manage the stairs at home, mostly.",
    },
    {
      topics: ['substance_use'],
      response: "Oh no, nothing like that. Just the wine on Fridays.",
    },
    {
      topics: ['empathy', 'reassurance'],
      response:
        "Thank you, doctor. That's kind of you to say. It has been worrying me a little, to be honest.",
    },
    {
      topics: ['explanation', 'closure'],
      response: 'That makes sense. Thank you for explaining it to me clearly.',
    },
  ],
  hiddenConcern: {
    id: 'stopped-bp-med',
    label: 'Stopped blood-pressure medication',
    description:
      'David stopped his antihypertensive about a week ago because it made him feel weak, and he has not told anyone - including his wife.',
    requiredTopic: 'medication_adherence',
    requiresNonjudgmental: true,
    clueResponse:
      "Well... I take them most days. The blood pressure one, sometimes it makes me feel a bit off. (He looks away.)",
    guardedResponse:
      "I... I take them like I'm supposed to. (He shifts uncomfortably and goes quiet.)",
    partialResponse:
      "To be honest, that one pill for blood pressure... it made me feel weak and tired. I haven't been taking it like I should.",
    revealResponse:
      "Actually yes... the blood pressure pill made me feel weak, so I stopped it about a week ago. I didn't want to make a fuss, and I haven't told my wife.",
  },
  measurements: [
    {
      id: 'vitals',
      label: 'Repeat vitals',
      category: 'vitals',
      result: 'BP 148/86, HR 82, RR 16, SpO2 97%, T 36.7°C',
      interpretation: 'info',
      indicated: true,
    },
    {
      id: 'orthostatic',
      label: 'Orthostatic vitals',
      category: 'vitals',
      result:
        'Lying BP 150/88 HR 80 → Standing BP 120/74 HR 98. Drop of 30 mmHg systolic with symptoms. POSITIVE for orthostatic hypotension.',
      interpretation: 'key',
      indicated: true,
    },
    {
      id: 'neuro',
      label: 'Focused neuro exam',
      category: 'exam',
      result: 'Cranial nerves intact, normal power and sensation, no focal deficit, gait cautious but non-ataxic.',
      interpretation: 'normal',
      indicated: true,
    },
    {
      id: 'med-review',
      label: 'Medication review',
      category: 'review',
      result:
        'Listed: antihypertensive + statin. Adherence UNCLEAR from chart - pharmacy refill overdue by ~10 days.',
      interpretation: 'key',
      indicated: true,
      unlockedByHiddenConcern: false,
    },
    {
      id: 'ecg',
      label: 'ECG',
      category: 'exam',
      result: 'Normal sinus rhythm, rate 84, no ischemic changes, no arrhythmia.',
      interpretation: 'normal',
      indicated: true,
    },
    {
      id: 'bmp',
      label: 'Basic metabolic panel',
      category: 'lab',
      result: 'Mild dehydration (urea slightly elevated, creatinine high-normal). Electrolytes otherwise normal.',
      interpretation: 'abnormal',
      indicated: true,
    },
    {
      id: 'cbc',
      label: 'Complete blood count',
      category: 'lab',
      result: 'No anemia, no leukocytosis. Unremarkable.',
      interpretation: 'normal',
      indicated: false,
    },
    {
      id: 'ct-head',
      label: 'CT head',
      category: 'imaging',
      result: 'No acute intracranial abnormality. (Low yield given non-focal exam.)',
      interpretation: 'normal',
      indicated: false,
    },
  ],
  expectedDifferential: [
    'Orthostatic hypotension (medication-related)',
    'Volume depletion / dehydration',
    'Cardiac arrhythmia',
    'Cerebrovascular event (cannot-miss)',
  ],
  cannotMiss: 'Cerebrovascular event / posterior circulation stroke',
  expectedPlan: [
    'Confirm orthostatic vitals',
    'Reconcile medications and address adherence + side effects',
    'Assess and reduce falls risk',
    'Rehydrate and recheck',
    'Involve supervising physician before changing antihypertensive',
    'Safety-net and explain clearly to patient',
  ],
  status: 'live',
}
