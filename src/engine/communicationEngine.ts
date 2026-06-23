import type { IntentResult } from '@/types'

export interface CommEvaluation {
  trustDelta: number
  presence: {
    calmLeadership: number
    verbalStructure: number
    clarity: number
    empathy: number
    nonjudgmental: number
    reassurance: number
  }
  notes: string[]
}

/**
 * Evaluates HOW the student communicated and returns trust + presence deltas.
 * Trust rises with introduction, empathy, reassurance, confidentiality, normalizing
 * bridges; it falls with judgmental or rushed phrasing on sensitive topics.
 */
export function evaluateCommunication(intent: IntentResult): CommEvaluation {
  const presence = {
    calmLeadership: 0,
    verbalStructure: 0,
    clarity: 0,
    empathy: 0,
    nonjudgmental: 0,
    reassurance: 0,
  }
  const notes: string[] = []
  let trustDelta = 0

  if (intent.introducedSelf) {
    trustDelta += 6
    presence.verbalStructure += 8
    presence.calmLeadership += 5
    notes.push('Professional introduction set a calm, structured tone.')
  }
  if (intent.hasNormalizingBridge) {
    trustDelta += 8
    presence.nonjudgmental += 12
    presence.verbalStructure += 6
    notes.push('Normalizing bridge made a sensitive question feel safe.')
  }
  if (intent.topics.includes('empathy')) {
    trustDelta += 6
    presence.empathy += 12
    notes.push('Empathic acknowledgement strengthened rapport.')
  }
  if (intent.hasReassurance) {
    trustDelta += 5
    presence.reassurance += 12
    presence.calmLeadership += 6
    notes.push('Reassurance reduced patient anxiety.')
  }
  if (intent.hasConfidentiality) {
    trustDelta += 7
    presence.nonjudgmental += 6
    presence.reassurance += 6
    notes.push('Explicit confidentiality made disclosure safer.')
  }
  if (intent.topics.includes('explanation')) {
    presence.clarity += 10
    trustDelta += 3
    notes.push('Clear explanation improved patient understanding.')
  }
  if (intent.topics.includes('closure')) {
    presence.verbalStructure += 8
    presence.clarity += 6
    trustDelta += 4
    notes.push('Safety-netting / closure gave the patient a clear next step.')
  }

  switch (intent.tone) {
    case 'judgmental':
      trustDelta -= 14
      presence.nonjudgmental -= 18
      presence.empathy -= 8
      notes.push('Phrasing felt judgmental, which made the patient guarded.')
      break
    case 'rushed':
      trustDelta -= 6
      presence.calmLeadership -= 8
      presence.clarity -= 5
      notes.push('Delivery felt rushed before a sensitive topic.')
      break
    case 'empathetic':
      presence.empathy += 4
      break
    case 'patient_centered':
      presence.calmLeadership += 3
      break
    case 'unclear':
      presence.clarity -= 4
      break
  }

  return { trustDelta, presence, notes }
}
