import type { ClinicalCase } from '@/types'
import { elderlyDizzinessAdherence } from './elderlyDizzinessAdherence'
import { chestPainSubstance } from './chestPainSubstance'
import { abdominalPainPregnancy } from './abdominalPainPregnancy'
import { copdLowHealthLiteracy } from './copdLowHealthLiteracy'

export const cases: ClinicalCase[] = [
  elderlyDizzinessAdherence,
  chestPainSubstance,
  abdominalPainPregnancy,
  copdLowHealthLiteracy,
]

export const caseById = (id: string) => cases.find((c) => c.id === id)

export { elderlyDizzinessAdherence }
