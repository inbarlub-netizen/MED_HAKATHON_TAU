/** Lightweight PHI detection for the Rotation Companion preview (regex/mock). */
export interface PhiHit {
  type: string
  match: string
}

const RULES: { type: string; re: RegExp }[] = [
  { type: 'Phone number', re: /\b(?:\+?\d[\d\s-]{7,}\d)\b/g },
  { type: 'ID / MRN', re: /\b\d{6,9}\b/g },
  { type: 'Email', re: /\b[\w.-]+@[\w.-]+\.\w+\b/g },
  { type: 'Exact date', re: /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/g },
]

export function scanForPhi(text: string): PhiHit[] {
  const hits: PhiHit[] = []
  for (const { type, re } of RULES) {
    const matches = text.match(re)
    if (matches) matches.forEach((m) => hits.push({ type, match: m }))
  }
  return hits
}
