import type { LlmProvider } from './provider'

/**
 * Optional OpenAI-compatible provider. NOT used in the demo path.
 * Falls back to a safe string on any error so the UI never breaks.
 */
export function createOpenAICompatibleProvider(opts: {
  baseUrl: string
  apiKey: string
  model: string
}): LlmProvider {
  return {
    name: 'openai-compatible',
    async patientReply(system: string, user: string): Promise<string> {
      try {
        const res = await fetch(`${opts.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${opts.apiKey}`,
          },
          body: JSON.stringify({
            model: opts.model,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
            temperature: 0.6,
          }),
        })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = await res.json()
        const text = data?.choices?.[0]?.message?.content
        return typeof text === 'string' && text.trim() ? text.trim() : '…'
      } catch {
        return '…' // safe fallback - deterministic engine remains source of truth
      }
    },
  }
}
