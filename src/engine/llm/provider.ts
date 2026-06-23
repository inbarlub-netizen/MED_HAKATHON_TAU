/** Provider abstraction so an LLM can be swapped in later without touching the UI. */
export interface LlmProvider {
  name: string
  /** Returns a patient response. Implementations must fall back safely. */
  patientReply(system: string, user: string): Promise<string>
}

let active: LlmProvider | null = null
export function setProvider(p: LlmProvider) {
  active = p
}
export function getProvider(): LlmProvider | null {
  return active
}
