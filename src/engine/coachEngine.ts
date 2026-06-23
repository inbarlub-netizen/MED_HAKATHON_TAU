import type { HiddenConcernState, IntentResult } from '@/types'

export interface CoachTip {
  id: string
  tone: 'cyan' | 'violet' | 'warning' | 'success'
  text: string
}

/** Live coaching suggestions. Guides without revealing the answer. */
export function coachAfterTurn(
  intent: IntentResult,
  hiddenState: HiddenConcernState,
  turnIndex: number
): CoachTip | null {
  if (intent.tone === 'judgmental') {
    return {
      id: 'nonjudgmental-' + turnIndex,
      tone: 'warning',
      text: 'That phrasing sounded judgmental. Try a normalizing bridge: "Many people change or stop medications because of side effects, and that\'s completely understandable…"',
    }
  }
  if (
    intent.topics.includes('medication_adherence') &&
    intent.nonjudgmental &&
    !intent.hasNormalizingBridge &&
    hiddenState !== 'fully_revealed'
  ) {
    return {
      id: 'bridge-' + turnIndex,
      tone: 'cyan',
      text: 'You\'re on the right topic. Add a normalizing lead-in and the patient is more likely to open up.',
    }
  }
  if (hiddenState === 'clue_given' || hiddenState === 'partially_revealed') {
    return {
      id: 'followup-' + turnIndex,
      tone: 'violet',
      text: 'The patient just hinted at something. Gently follow up with empathy to let them finish the story.',
    }
  }
  if (hiddenState === 'fully_revealed') {
    return {
      id: 'unlocked-' + turnIndex,
      tone: 'success',
      text: 'Hidden concern unlocked. Consider ordering orthostatic vitals and a medication review, then move toward a plan.',
    }
  }
  return null
}

export const STARTER_PROMPTS = [
  'Hello David, my name is Maya, I\'m a medical student. What brings you in today?',
  'When did the dizziness start, and is it worse in any position?',
  'Are you having any weakness, slurred speech, or fainting?',
  'Can you tell me which medications you take?',
]

/** Two contrasting medication-adherence phrasings for the guided demo. */
export const DEMO_PHRASES = {
  bad: 'Are you taking your medications properly?',
  good: 'Many people stop or change their medications because of side effects, and that is completely understandable. Has anything like that happened to you recently?',
}
