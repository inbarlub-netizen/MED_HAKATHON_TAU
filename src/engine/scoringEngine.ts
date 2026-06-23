import type {
  ClinicalCase,
  EpaScore,
  HiddenConcernState,
  IntentTopic,
  Measurement,
  OsceResult,
  RubricScore,
} from '@/types'
import { clamp } from '@/lib/utils'

export interface ReasoningSubmission {
  summary: string
  differentials: string[]
  cannotMiss: string
  evidence: string
  testsRationale: string
  plan: string
  patientExplanation: string
}

export interface ScoreInput {
  c: ClinicalCase
  coveredTopics: IntentTopic[]
  flags: {
    introducedSelf: boolean
    usedNormalizing: boolean
    judgmentalAttempt: boolean
    empathyUsed: boolean
    confidentialityUsed: boolean
    closureUsed: boolean
    redFlagsAsked: boolean
  }
  hiddenState: HiddenConcernState
  orderedMeasurements: string[]
  trust: number
  presence: number
  presenceSub: { label: string; value: number }[]
  reasoning?: ReasoningSubmission
}

const has = (arr: IntentTopic[], t: IntentTopic) => arr.includes(t)

export function scoreEncounter(input: ScoreInput): OsceResult {
  const { c, coveredTopics, flags, hiddenState, orderedMeasurements, trust, presence, presenceSub, reasoning } = input
  const items: RubricScore[] = []

  /* 1. History taking - 20 */
  {
    const checks: [boolean, number, string][] = [
      [has(coveredTopics, 'open_question') || has(coveredTopics, 'symptom_history'), 4, 'opened with the presenting complaint'],
      [has(coveredTopics, 'onset_duration'), 4, 'clarified onset and timing'],
      [has(coveredTopics, 'associated_symptoms'), 4, 'explored associated symptoms'],
      [has(coveredTopics, 'medications'), 4, 'took a medication history'],
      [has(coveredTopics, 'social_history'), 4, 'covered social context'],
    ]
    items.push(buildItem('history', 'History taking', 20, checks,
      'Build the story before tests: onset, associated symptoms, meds, and social context.'))
  }

  /* 2. Red flags & safety - 15 */
  {
    const checks: [boolean, number, string][] = [
      [flags.redFlagsAsked || has(coveredTopics, 'red_flags'), 9, 'screened for red-flag / cannot-miss features'],
      [orderedMeasurements.includes('orthostatic') || orderedMeasurements.includes('ecg'), 6, 'sought objective safety data'],
    ]
    items.push(buildItem('redflags', 'Red flags & safety', 15, checks,
      `Always screen the cannot-miss diagnosis (${c.cannotMiss}).`))
  }

  /* 3. Communication & empathy - 15 */
  {
    const commScore = Math.round(
      clamp(
        (flags.introducedSelf ? 3 : 0) +
          (flags.empathyUsed ? 4 : 0) +
          (flags.usedNormalizing ? 4 : 0) +
          (flags.closureUsed ? 2 : 0) +
          (presence / 100) * 2 -
          (flags.judgmentalAttempt ? 3 : 0),
        0,
        15
      )
    )
    items.push({
      id: 'communication',
      label: 'Communication & empathy',
      earned: commScore,
      max: 15,
      evidence: flags.usedNormalizing
        ? 'You normalized a sensitive topic and built trust before asking.'
        : 'You connected with the patient but could structure sensitive questions more deliberately.',
      missed: flags.judgmentalAttempt
        ? 'An early judgmental phrasing briefly reduced patient trust.'
        : undefined,
      suggestion: flags.judgmentalAttempt
        ? 'Lead sensitive questions with a normalizing bridge before asking.'
        : undefined,
    })
  }

  /* 4. Hidden concern discovery - 15 */
  {
    const map: Record<HiddenConcernState, number> = {
      fully_revealed: 15,
      addressed_with_empathy: 15,
      partially_revealed: 9,
      clue_given: 5,
      locked: 0,
      missed: 0,
    }
    const earned = map[hiddenState] ?? 0
    items.push({
      id: 'hidden',
      label: 'Hidden concern discovery',
      earned,
      max: 15,
      evidence:
        earned >= 15
          ? `You uncovered the hidden concern: ${c.hiddenConcern.label.toLowerCase()}.`
          : earned > 0
            ? 'You got partway - the patient hinted but did not fully disclose.'
            : 'The hidden concern stayed locked this encounter.',
      missed: earned < 15 ? `Hidden concern: ${c.hiddenConcern.description}` : undefined,
      suggestion:
        earned < 15
          ? 'Ask the sensitive topic with a normalizing, nonjudgmental bridge (and confidentiality where relevant).'
          : undefined,
    })
  }

  /* 5. Physical exam & tests - 15 */
  {
    const indicated = c.measurements.filter((m) => m.indicated).map((m) => m.id)
    const ordered = orderedMeasurements
    const indicatedHit = indicated.filter((id) => ordered.includes(id)).length
    const unnecessary = ordered.filter((id) => {
      const m = c.measurements.find((x) => x.id === id)
      return m && !m.indicated
    }).length
    const base = indicated.length ? Math.round((indicatedHit / indicated.length) * 15) : 0
    const earned = clamp(base - unnecessary * 2, 0, 15)
    items.push({
      id: 'tests',
      label: 'Physical exam & tests',
      earned,
      max: 15,
      evidence: `Ordered ${indicatedHit}/${indicated.length} indicated investigations.`,
      missed: unnecessary > 0 ? `${unnecessary} low-yield test(s) ordered (efficiency penalty).` : indicatedHit < indicated.length ? 'Some key tests were not ordered.' : undefined,
      suggestion: unnecessary > 0 ? 'Clarify the story before broad testing to improve test efficiency.' : undefined,
    })
  }

  /* 6. Differential - 10 */
  {
    let earned = 0
    let evidence = 'No differential submitted.'
    if (reasoning) {
      const provided = reasoning.differentials.filter((d) => d.trim()).length
      const cannotMissHit = reasoning.cannotMiss.trim().length > 3
      earned = clamp(Math.min(provided, 3) * 2 + (cannotMissHit ? 4 : 0), 0, 10)
      evidence = `Listed ${provided} differential(s)${cannotMissHit ? ' and named a cannot-miss diagnosis.' : '.'}`
    }
    items.push({
      id: 'differential',
      label: 'Differential diagnosis',
      earned,
      max: 10,
      evidence,
      missed: reasoning && !reasoning.cannotMiss.trim() ? 'No cannot-miss diagnosis named.' : undefined,
      suggestion: !reasoning ? 'Submit a prioritized differential including the cannot-miss diagnosis.' : undefined,
    })
  }

  /* 7. Management & closure - 10 */
  {
    let earned = 0
    let evidence = 'No management plan submitted.'
    if (reasoning) {
      const planLen = reasoning.plan.trim().length
      const adherenceInPlan = /adher|medication|side effect|reconcil/i.test(reasoning.plan)
      const explained = reasoning.patientExplanation.trim().length > 5
      earned = clamp((planLen > 20 ? 4 : planLen > 0 ? 2 : 0) + (adherenceInPlan ? 3 : 0) + (explained ? 1 : 0) + (flags.closureUsed ? 2 : 0), 0, 10)
      evidence = adherenceInPlan
        ? 'Plan addressed medication adherence and patient explanation.'
        : 'Plan submitted, but the medication-adherence issue was under-addressed.'
    }
    items.push({
      id: 'management',
      label: 'Management & closure',
      earned,
      max: 10,
      evidence,
      missed: reasoning && !/adher|medication/i.test(reasoning.plan) ? 'Plan should address the medication adherence root cause.' : undefined,
      suggestion: !reasoning ? 'Submit a plan that addresses the root cause and safety-nets the patient.' : undefined,
    })
  }

  const total = items.reduce((s, i) => s + i.earned, 0)
  const max = items.reduce((s, i) => s + i.max, 0)

  const epas = buildEpas(items, flags, hiddenState)
  const communication = items.find((i) => i.id === 'communication')?.earned ?? 0

  return {
    total,
    max,
    items,
    epas,
    trust,
    presence,
    presenceSub,
    communication: Math.round((communication / 15) * 100),
    hiddenConcern: hiddenState,
    summary: buildSummary(total, max, hiddenState, flags),
  }
}

function buildItem(
  id: string,
  label: string,
  max: number,
  checks: [boolean, number, string][],
  suggestion: string
): RubricScore {
  const earned = checks.reduce((s, [ok, pts]) => s + (ok ? pts : 0), 0)
  const done = checks.filter(([ok]) => ok).map(([, , d]) => d)
  const missing = checks.filter(([ok]) => !ok).map(([, , d]) => d)
  return {
    id,
    label,
    earned: clamp(earned, 0, max),
    max,
    evidence: done.length ? `You ${done.join(', ')}.` : 'Limited coverage in this area.',
    missed: missing.length ? `Did not: ${missing.join(', ')}.` : undefined,
    suggestion: missing.length ? suggestion : undefined,
  }
}

function buildEpas(items: RubricScore[], flags: ScoreInput['flags'], hidden: HiddenConcernState): EpaScore[] {
  const get = (id: string) => items.find((i) => i.id === id)
  const ratio = (id: string) => {
    const it = get(id)
    return it ? it.earned / it.max : 0
  }
  const lvl = (r: number): 1 | 2 | 3 | 4 | 5 => (r >= 0.85 ? 5 : r >= 0.65 ? 4 : r >= 0.45 ? 3 : r >= 0.25 ? 2 : 1)
  return [
    { id: 'EPA1', label: 'Gather history & perform exam', level: lvl(ratio('history')), note: 'Data gathering depth' },
    { id: 'EPA2', label: 'Prioritize a differential', level: lvl(ratio('differential')), note: 'Reasoning' },
    { id: 'EPA3', label: 'Recommend & interpret tests', level: lvl(ratio('tests')), note: 'Investigation efficiency' },
    { id: 'EPA6', label: 'Present an oral report', level: lvl(ratio('management')), note: 'Synthesis & closure' },
    { id: 'EPA9', label: 'Communicate & collaborate', level: lvl((ratio('communication') + ratio('hidden')) / 2), note: 'Sensitive communication' },
    { id: 'EPA13', label: 'Identify safety / system issues', level: lvl(ratio('redflags')), note: 'Safety' },
  ]
}

function buildSummary(total: number, max: number, hidden: HiddenConcernState, flags: ScoreInput['flags']): string {
  const unlocked = hidden === 'fully_revealed' || hidden === 'addressed_with_empathy'
  if (unlocked && !flags.judgmentalAttempt)
    return 'Strong encounter. You uncovered the hidden concern with nonjudgmental, structured communication and built a safe plan.'
  if (unlocked && flags.judgmentalAttempt)
    return 'Good recovery. An early judgmental phrasing guarded the patient, but your improved phrasing unlocked the hidden concern.'
  return 'The hidden concern stayed locked. Focus next attempt on a normalizing bridge before sensitive questions.'
}
