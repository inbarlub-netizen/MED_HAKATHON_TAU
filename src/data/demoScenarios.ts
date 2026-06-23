import type { ReasoningSubmission } from '@/engine/scoringEngine'

/**
 * Scripted demo encounters that play through the REAL engine.
 * Each "say" line is sent to patientAgent/communicationEngine just like a typed
 * question, so the scores, hidden-concern state, and replay are authentic - only
 * the student's lines are pre-written so judges can watch a conversation unfold.
 */
export interface ScenarioStep {
  kind: 'say' | 'order' | 'reason' | 'finish'
  /** student utterance (for 'say') */
  text?: string
  /** simulated spoken duration in seconds - drives speech-rate / fluency metrics */
  dur?: number
  /** measurement id (for 'order') */
  id?: string
  /** reasoning payload (for 'reason') */
  reason?: ReasoningSubmission
  /** override the pause (ms) before the NEXT step */
  pause?: number
}

export interface DemoScenario {
  id: string
  title: string
  subtitle: string
  tone: 'success' | 'danger' | 'warning'
  expected: string
  steps: ScenarioStep[]
}

const goodReason: ReasoningSubmission = {
  summary: '72-year-old man with one week of postural dizziness and near falls.',
  differentials: ['Orthostatic hypotension (medication-related)', 'Volume depletion / dehydration', 'Cardiac arrhythmia'],
  cannotMiss: 'Cerebrovascular event / posterior circulation stroke',
  evidence: 'Symptoms on standing, positive orthostatic vitals, recently stopped his antihypertensive.',
  testsRationale: 'Orthostatic vitals and medication review first; ECG to exclude arrhythmia.',
  plan: 'Confirm orthostatic vitals, reconcile medications and address adherence and side effects, assess falls risk, rehydrate, involve the supervising physician before changing the antihypertensive, and safety-net.',
  patientExplanation: 'Your dizziness is most likely a blood-pressure drop on standing, linked to the medication you stopped. We will adjust it safely together.',
}

const weakReason: ReasoningSubmission = {
  summary: 'Old man, dizzy.',
  differentials: ['Vertigo'],
  cannotMiss: '',
  evidence: 'He feels dizzy.',
  testsRationale: 'Ordered a CT to be safe.',
  plan: 'Maybe some tests and see how it goes.',
  patientExplanation: '',
}

/* ===================== 1. EXEMPLARY ===================== */
const exemplary: DemoScenario = {
  id: 'exemplary',
  title: 'Exemplary encounter',
  subtitle: 'Maya runs it beautifully - every domain green',
  tone: 'success',
  expected: 'Hidden concern unlocked · high trust & presence',
  steps: [
    { kind: 'say', text: "Hello David, my name is Maya, I'm a fourth-year medical student. I'm sorry to hear you've not been feeling well - what brings you in today?", dur: 8 },
    { kind: 'say', text: "That sounds worrying, I understand. When did the dizziness start, and is it worse when you stand up?", dur: 6 },
    { kind: 'say', text: "Thank you. Have you noticed any weakness, slurred speech, fainting, or a bad headache?", dur: 6 },
    { kind: 'say', text: "That's reassuring. Can you tell me which medications you take regularly?", dur: 5 },
    { kind: 'say', text: "Many people stop or change their medications because of side effects, and that is completely understandable. Has anything like that happened to you recently?", dur: 9, pause: 2600 },
    { kind: 'say', text: "Thank you for trusting me with that, David. There's nothing to be embarrassed about - this is exactly the kind of thing we need to know to keep you safe.", dur: 8 },
    { kind: 'say', text: "Do you have any allergies, and who do you live with at home?", dur: 5 },
    { kind: 'order', id: 'orthostatic', pause: 900 },
    { kind: 'order', id: 'med-review', pause: 900 },
    { kind: 'order', id: 'ecg', pause: 900 },
    { kind: 'order', id: 'neuro', pause: 1200 },
    { kind: 'say', text: "To summarise: your dizziness is most likely a blood-pressure drop when you stand, linked to stopping your tablet. We'll check a few things and adjust it safely with your doctor. Please come straight back if you feel faint or fall.", dur: 11 },
    { kind: 'reason', reason: goodReason, pause: 800 },
    { kind: 'finish' },
  ],
}

/* ===================== 2. STRUGGLING ===================== */
const struggling: DemoScenario = {
  id: 'struggling',
  title: 'Struggling encounter',
  subtitle: 'Rushed, judgmental, stumbling delivery - coaching needed',
  tone: 'danger',
  expected: 'Hidden concern stays locked · trust drops · low score',
  steps: [
    { kind: 'say', text: "Um... hi, so, like, what's the problem today?", dur: 6 },
    { kind: 'say', text: "Uh, ok, and when did it, um, start I guess?", dur: 6 },
    { kind: 'say', text: "Are you taking your medications properly?", dur: 3, pause: 2600 },
    { kind: 'say', text: "Why did you stop taking it?", dur: 3, pause: 2200 },
    { kind: 'say', text: "Ok um, I don't know, like, maybe we'll just do some tests or something.", dur: 7 },
    { kind: 'order', id: 'ct-head', pause: 900 },
    { kind: 'order', id: 'cbc', pause: 1200 },
    { kind: 'reason', reason: weakReason, pause: 800 },
    { kind: 'finish' },
  ],
}

/* ===================== 3. RECOVERY ===================== */
const recovery: DemoScenario = {
  id: 'recovery',
  title: 'Recovery encounter',
  subtitle: 'Starts judgmental, then recovers with a normalizing bridge',
  tone: 'warning',
  expected: 'Patient guards, then opens up · partial → full disclosure',
  steps: [
    { kind: 'say', text: "Hi David, what brings you in today?", dur: 4 },
    { kind: 'say', text: "When did the dizziness start?", dur: 4 },
    { kind: 'say', text: "Are you taking your medications properly?", dur: 3, pause: 2600 },
    { kind: 'say', text: "I'm sorry, that came out wrong. Let me ask differently.", dur: 5, pause: 1800 },
    { kind: 'say', text: "Many people stop or change their medications because of side effects, and that's completely understandable. Has anything like that happened to you recently?", dur: 9, pause: 2600 },
    { kind: 'say', text: "Thank you for telling me - that's really helpful and nothing to worry about. We'll sort it out together.", dur: 7 },
    { kind: 'order', id: 'orthostatic', pause: 900 },
    { kind: 'order', id: 'med-review', pause: 1200 },
    { kind: 'reason', reason: goodReason, pause: 800 },
    { kind: 'finish' },
  ],
}

export const demoScenarios: DemoScenario[] = [exemplary, struggling, recovery]
