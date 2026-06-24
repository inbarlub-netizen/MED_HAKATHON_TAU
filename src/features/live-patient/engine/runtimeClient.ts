import type { RuntimeStatus } from '../types'

/**
 * Optional local-runtime client. The Live Patient Room runs fully in the browser
 * by default; if a local runtime is reachable at localhost:8787 it reports richer
 * providers (Ollama / Whisper / Kokoro / lip-sync). Everything degrades silently.
 */

const BASE = 'http://localhost:8787'

export const BROWSER_RUNTIME: RuntimeStatus = {
  online: false,
  llm: 'mock',
  stt: 'browser',
  tts: 'browser',
  avatar: 'fallback',
}

export async function checkRuntime(timeoutMs = 700): Promise<RuntimeStatus> {
  try {
    const ctrl = new AbortController()
    const id = setTimeout(() => ctrl.abort(), timeoutMs)
    const r = await fetch(`${BASE}/api/health`, { signal: ctrl.signal })
    clearTimeout(id)
    if (!r.ok) return BROWSER_RUNTIME
    const j = await r.json()
    const p = j.providers ?? {}
    return {
      online: true,
      llm: p.llm ?? 'mock',
      stt: p.stt ?? 'browser',
      tts: p.tts ?? 'browser',
      avatar: p.avatar ?? 'fallback',
    }
  } catch {
    return BROWSER_RUNTIME
  }
}

/** Phase B hook: free-form patient reply from a local LLM. Returns null in browser mode. */
export async function localPatientReply(payload: unknown): Promise<{ patientText: string; emotion: string } | null> {
  try {
    const r = await fetch(`${BASE}/api/patient-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}
