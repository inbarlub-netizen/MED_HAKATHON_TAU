import type { LlmProvider } from './provider'

/** Deterministic mock provider - the default. No API key required. */
export const mockProvider: LlmProvider = {
  name: 'mock',
  async patientReply(_system: string, user: string): Promise<string> {
    return `(${user.slice(0, 0)}I can tell you a little more about that.)`
  },
}
