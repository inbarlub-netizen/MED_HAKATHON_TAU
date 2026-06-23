import type { ClinicalCase, EmotionalState, HiddenConcernState, IntentResult } from '@/types'
import { evaluateHiddenConcern } from './hiddenConcernEngine'

export interface PatientTurn {
  text: string
  emotion: EmotionalState
  hiddenConcernState: HiddenConcernState
  hiddenConcernChanged: boolean
  hiddenConcernSentiment: 'good' | 'missed' | 'warning' | 'unlock' | 'neutral'
  matchedDisclosure: boolean
}

/**
 * Virtual patient agent. Produces a persona-consistent response based on the
 * student's latest intent, enforcing disclosure rules and hidden-concern gating.
 */
export function patientRespond(
  c: ClinicalCase,
  intent: IntentResult,
  hiddenState: HiddenConcernState,
  emotion: EmotionalState
): PatientTurn {
  // 1) Hidden concern always takes priority when the student is on its topic.
  const hidden = evaluateHiddenConcern(c.hiddenConcern, hiddenState, intent)
  if (hidden.patientResponse) {
    const newEmotion: EmotionalState =
      hidden.sentiment === 'unlock'
        ? 'open'
        : hidden.sentiment === 'warning'
          ? 'guarded'
          : 'reassured'
    return {
      text: hidden.patientResponse,
      emotion: newEmotion,
      hiddenConcernState: hidden.nextState,
      hiddenConcernChanged: hidden.changed,
      hiddenConcernSentiment: hidden.sentiment,
      matchedDisclosure: true,
    }
  }

  // 2) Standard disclosure rules (factual history).
  for (const rule of c.disclosures) {
    if (rule.topics.some((t) => intent.topics.includes(t))) {
      if (rule.requiresGoodTone && intent.tone === 'judgmental' && rule.guardedResponse) {
        return reply(rule.guardedResponse, 'guarded', hiddenState, false)
      }
      const emo: EmotionalState = intent.topics.includes('empathy') || intent.hasReassurance ? 'reassured' : emotion
      return reply(rule.response, emo, hiddenState, true)
    }
  }

  // 3) Empathy/reassurance with no specific topic - patient warms up.
  if (intent.topics.includes('empathy') || intent.hasReassurance) {
    return reply(
      "Thank you, doctor. That means a lot. I do feel a bit better talking it through.",
      'reassured',
      hiddenState,
      false
    )
  }

  // 3b) Opening / introduction - restate the chief complaint (reuse a voiced line).
  if (intent.topics.includes('open_question') || intent.topics.includes('introduction')) {
    const onset = c.disclosures.find((d) => d.topics.includes('onset_duration'))?.response
    return reply(
      onset ?? "It's this dizziness, doctor. It comes over me when I stand up.",
      emotion,
      hiddenState,
      true
    )
  }

  // 4) Judgmental tone with no matched topic - patient pulls back.
  if (intent.tone === 'judgmental') {
    return reply('(He hesitates and looks uncomfortable.) I... I suppose so.', 'guarded', hiddenState, false)
  }

  // 5) Irrelevant / unrecognized - natural, non-rewarding answer.
  return reply(
    personaFiller(c),
    emotion,
    hiddenState,
    false
  )
}

function reply(
  text: string,
  emotion: EmotionalState,
  hiddenConcernState: HiddenConcernState,
  matchedDisclosure: boolean
): PatientTurn {
  return {
    text,
    emotion,
    hiddenConcernState,
    hiddenConcernChanged: false,
    hiddenConcernSentiment: 'neutral',
    matchedDisclosure,
  }
}

function personaFiller(c: ClinicalCase): string {
  switch (c.patient.persona) {
    case 'confused-elderly':
      return "I'm sorry, I'm not quite sure what you mean. Could you ask me another way?"
    case 'guarded':
      return "Hmm. I'm not sure that's relevant... but okay."
    case 'embarrassed':
      return '(quietly) I... I don\'t really know how to answer that.'
    case 'low-health-literacy':
      return "I don't really understand all the medical words, sorry."
    default:
      return "I'm not sure, doctor. What else would you like to know?"
  }
}
