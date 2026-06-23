import type { RubricItemDef } from '@/types'

/** 100-point OSCE rubric used by the scoring engine. */
export const osceRubric: RubricItemDef[] = [
  { id: 'history', label: 'History taking', category: 'Data gathering', max: 20 },
  { id: 'redflags', label: 'Red flags & safety', category: 'Safety', max: 15 },
  { id: 'communication', label: 'Communication & empathy', category: 'Communication', max: 15 },
  { id: 'hidden', label: 'Hidden concern discovery', category: 'Communication', max: 15 },
  { id: 'tests', label: 'Physical exam & tests', category: 'Investigation', max: 15 },
  { id: 'differential', label: 'Differential diagnosis', category: 'Reasoning', max: 10 },
  { id: 'management', label: 'Management & closure', category: 'Reasoning', max: 10 },
]

export const epaMap = [
  { id: 'EPA1', label: 'Gather history & perform exam' },
  { id: 'EPA2', label: 'Prioritize a differential diagnosis' },
  { id: 'EPA3', label: 'Recommend & interpret diagnostic tests' },
  { id: 'EPA5', label: 'Document the clinical encounter' },
  { id: 'EPA6', label: 'Present an oral report' },
  { id: 'EPA9', label: 'Communicate & collaborate' },
  { id: 'EPA13', label: 'Identify safety / system issues' },
]
