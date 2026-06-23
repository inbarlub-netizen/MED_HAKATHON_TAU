import type { IntentResult, IntentTopic, Tone } from '@/types'

/** Rule-based intent classifier. Tuned to work well for the demo phrases. */

const TOPIC_PATTERNS: { topic: IntentTopic; patterns: RegExp[] }[] = [
  { topic: 'introduction', patterns: [/\b(my name is|i'?m dr|i am dr|i'?m a (student|doctor)|medical student|i'?ll be (seeing|looking after))\b/i] },
  { topic: 'open_question', patterns: [/\b(what brings you in|how can i help|tell me (what'?s|whats) going on|what'?s been happening|how are you feeling|what'?s the problem|what'?s going on|the problem today|what seems to be|what can i do for you|what'?s troubling you)\b/i] },
  { topic: 'onset_duration', patterns: [/\b(when did|how long|since when|start(ed)?|began|onset|first notice)\b/i] },
  { topic: 'associated_symptoms', patterns: [/\b(any other|anything else|chest pain|palpitation|heart (rac|pound)|nausea|sweat|fever|headache|vision|along with)\b/i] },
  { topic: 'red_flags', patterns: [/\b(weakness|numb|slurred|speech|face droop|worst headache|faint|black ?out|loss of consciousness|focal|stroke)\b/i] },
  { topic: 'medication_adherence', patterns: [/\b(taking (it|them|your med)|miss(ed|ing)? (a )?dose|stop(ped)? (taking|your)|skip(ped|ping)?|run out|how often do you take|been able to take|side effect.*(stop|miss)|change.* med|forget to take)\b/i] },
  { topic: 'medications', patterns: [/\b(medication|medicine|tablets?|pills?|drugs you take|prescri|inhaler|what do you take)\b/i] },
  { topic: 'allergies', patterns: [/\b(allerg)/i] },
  { topic: 'substance_use', patterns: [/\b(cocaine|recreational|drugs|alcohol|drink|smoke|cigarette|substance|weed|cannabis)\b/i] },
  { topic: 'sexual_history', patterns: [/\b(sexual|partner|intercourse|sexually active)\b/i] },
  { topic: 'pregnancy', patterns: [/\b(pregnan|period|menstr|last period|missed period|contracept)\b/i] },
  { topic: 'social_history', patterns: [/\b(live with|at home|work|occupation|family|support|stairs|who do you live|smoke|alcohol|drink)\b/i] },
  { topic: 'confidentiality', patterns: [/\b(confidential|between us|stays? (with|between)|private|won'?t (tell|share)|no one else|just between)\b/i] },
  { topic: 'reassurance', patterns: [/\b(you'?re safe|we'?ll (take care|look after|figure|go step)|don'?t worry|here to help|we'?ll get to the bottom|i'?m here|take our time)\b/i] },
  { topic: 'empathy', patterns: [/\b(that sounds|i (understand|can see|hear you|appreciate)|must be (hard|worrying|scary|frustrating)|i'?m sorry|completely understandable|no need to apolog|that'?s okay)\b/i] },
  { topic: 'explanation', patterns: [/\b(what'?s happening is|this (could|might) be|the reason|let me explain|because|what this means|i think (it'?s|this is))\b/i] },
  { topic: 'closure', patterns: [/\b(next step|follow up|come back if|safety net|to summari|plan (is|going)|we'?ll (do|arrange|check)|before you go)\b/i] },
  { topic: 'differential', patterns: [/\b(differential|could be|likely diagnos|i'?m thinking|possib(le|ility))\b/i] },
  { topic: 'management_plan', patterns: [/\b(management|treatment|i'?ll (start|arrange|order)|plan is|we should|refer)\b/i] },
  { topic: 'symptom_history', patterns: [/\b(dizz|describe (the|your)|what (does|is) (it|the) (feel|like)|spinning|lightheaded|unsteady|breath|pain)\b/i] },
]

const JUDGMENTAL = [
  /\bproperly\b/i,
  /\bcompliant\b/i,
  /\bsupposed to\b/i,
  /\bwhy did you (stop|not|fail)/i,
  /\bare you on drugs\b/i,
  /\byou should have\b/i,
  /\bdidn'?t you\b/i,
  /\bof course you/i,
]
const RUSHED = [/^\b(quick|just|only)\b/i, /\bhurry\b/i]
const NORMALIZING_BRIDGE = [
  /\bmany people\b/i,
  /\bit'?s (very )?common\b/i,
  /\bsome (people|patients)\b/i,
  /\bthat'?s (completely )?understandable\b/i,
  /\bnot unusual\b/i,
  /\ba lot of people\b/i,
  /\bnothing to be (ashamed|embarrassed)\b/i,
]

function detectTone(text: string, nonjudgmental: boolean, empathetic: boolean, patientCentered: boolean): Tone {
  if (JUDGMENTAL.some((r) => r.test(text))) return 'judgmental'
  if (RUSHED.some((r) => r.test(text)) && text.split(/\s+/).length < 7) return 'rushed'
  if (empathetic) return 'empathetic'
  if (patientCentered) return 'patient_centered'
  if (text.trim().length < 4) return 'unclear'
  return 'neutral'
}

export function classifyIntent(text: string): IntentResult {
  const topics: IntentTopic[] = []
  for (const { topic, patterns } of TOPIC_PATTERNS) {
    if (patterns.some((p) => p.test(text))) topics.push(topic)
  }
  if (topics.length === 0) topics.push('unknown')

  const isJudgmental = JUDGMENTAL.some((r) => r.test(text))
  const hasNormalizingBridge = NORMALIZING_BRIDGE.some((r) => r.test(text))
  const hasConfidentiality = topics.includes('confidentiality')
  const hasReassurance = topics.includes('reassurance')
  const hasEmpathy = topics.includes('empathy') || hasNormalizingBridge
  const introducedSelf = topics.includes('introduction')
  const patientCentered = hasEmpathy || hasReassurance || hasConfidentiality

  const nonjudgmental = !isJudgmental && (hasNormalizingBridge || hasEmpathy || !topicIsSensitive(topics) ? true : !isJudgmental)

  const tone = detectTone(text, nonjudgmental, hasEmpathy, patientCentered)

  return {
    topics: dedupe(topics),
    tone,
    nonjudgmental: !isJudgmental,
    hasConfidentiality,
    hasReassurance,
    hasNormalizingBridge,
    introducedSelf,
    rawText: text,
  }
}

function topicIsSensitive(topics: IntentTopic[]) {
  return topics.some((t) =>
    ['medication_adherence', 'substance_use', 'sexual_history', 'pregnancy'].includes(t)
  )
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}
