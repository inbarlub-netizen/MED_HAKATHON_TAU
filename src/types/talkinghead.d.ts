// Type shim for @met4citizen/talkinghead (no bundled .d.ts)
declare module '@met4citizen/talkinghead' {
  export interface TalkingHeadOptions {
    audioCtx?: AudioContext
    ttsEndpoint?: string | null
    lipsyncModules?: string[]
    cameraDistance?: number
    cameraY?: number
    modelFPS?: number
    [key: string]: unknown
  }

  export interface SpeakAudioPayload {
    audio: AudioBuffer | ArrayBuffer | ArrayBuffer[]
    words?: string[]
    wtimes?: number[]
    wdurations?: number[]
    visemes?: number[]
    vtimes?: number[]
    vdurations?: number[]
    markers?: Array<() => void>
    mtimes?: number[]
  }

  export class TalkingHead {
    constructor(node: HTMLElement, opt?: TalkingHeadOptions)
    showAvatar(avatar: { url: string; body?: string; lipsyncLang?: string; avatarMood?: string; baseline?: Record<string, number>; [key: string]: unknown }, onprogress?: ((n: number) => void) | null): Promise<void>
    closeAvatar(): void
    speakAudio(audio: SpeakAudioPayload, opt?: Record<string, unknown>, onsubtitles?: null): void
    speakText(text: string, opt?: Record<string, unknown>, onsubtitles?: null): void
    stopSpeaking(): void
    setMood(mood: string): void
    setView(view: 'full' | 'mid' | 'upper' | 'head', opt?: Record<string, unknown>): void
  }
}
