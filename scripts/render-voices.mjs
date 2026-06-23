/**
 * Pre-renders a fully-voiced two-person encounter using Kokoro TTS
 * (open-source, Apache-2.0, runs locally — no API key).
 *   node scripts/render-voices.mjs
 * Generates WAV via kokoro-js, converts to MP3 with ffmpeg, writes
 * public/audio/<id>.mp3 and src/data/voiceManifest.json.
 *
 * Voices: David (patient) = bm_george (British male, mature);
 *         Maya (clinician) = af_heart (warm professional female).
 *
 * normalizeLine / voiceId MUST stay identical to src/lib/voice.ts.
 */
import { KokoroTTS } from 'kokoro-js'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const audioDir = join(root, 'public', 'audio')
const tmpDir = join(root, 'scripts', '_wav')

function normalizeLine(t) {
  return t.replace(/\(.*?\)/g, ' ').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
}
function voiceId(text) {
  const s = normalizeLine(text)
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) & 0xffffffff
  return (h >>> 0).toString(16)
}
function speakable(t) {
  return t.replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim()
}

// ---- David (patient) lines ----
const davidLines = [
  "Hello doctor. I've been feeling dizzy on and off this past week, especially when I stand up. I nearly fell twice. I don't want to be a bother.",
  "It started about a week ago. It comes mostly when I get up from the chair or out of bed — a few seconds of the room spinning, then it settles.",
  "No chest pain really. Maybe my heart feels a little fast sometimes when I stand. No fainting, but I had to grab the table twice.",
  "No weakness in my arms or legs, my speech is fine, no bad headache. I just feel unsteady when I stand up.",
  "It's a lightheaded, unsteady feeling — not really the room spinning around me. Worse in the mornings.",
  "I take a pill for blood pressure... and something for my cholesterol. My wife usually sorts them out for me.",
  'No allergies that I know of.',
  "I live with my wife. I don't smoke. Maybe a glass of wine on Friday. I still manage the stairs at home, mostly.",
  "Oh no, nothing like that. Just the wine on Fridays.",
  "Thank you, doctor. That's kind of you to say. It has been worrying me a little, to be honest.",
  'That makes sense. Thank you for explaining it to me clearly.',
  "Well... I take them most days. The blood pressure one, sometimes it makes me feel a bit off. (He looks away.)",
  "I... I take them like I'm supposed to. (He shifts uncomfortably and goes quiet.)",
  "To be honest, that one pill for blood pressure... it made me feel weak and tired. I haven't been taking it like I should.",
  "Actually yes... the blood pressure pill made me feel weak, so I stopped it about a week ago. I didn't want to make a fuss, and I haven't told my wife.",
  'Thank you, doctor. That means a lot. I do feel a bit better talking it through.',
  '(He hesitates and looks uncomfortable.) I... I suppose so.',
  "I'm sorry, I'm not quite sure what you mean. Could you ask me another way?",
]

// ---- Maya (clinician / student) scripted lines ----
const mayaLines = [
  "Hello David, my name is Maya, I'm a fourth-year medical student. I'm sorry to hear you've not been feeling well — what brings you in today?",
  "That sounds worrying, I understand. When did the dizziness start, and is it worse when you stand up?",
  "Thank you. Have you noticed any weakness, slurred speech, fainting, or a bad headache?",
  "That's reassuring. Can you tell me which medications you take regularly?",
  "Many people stop or change their medications because of side effects, and that is completely understandable. Has anything like that happened to you recently?",
  "Thank you for trusting me with that, David. There's nothing to be embarrassed about — this is exactly the kind of thing we need to know to keep you safe.",
  "Do you have any allergies, and who do you live with at home?",
  "To summarise: your dizziness is most likely a blood-pressure drop when you stand, linked to stopping your tablet. We'll check a few things and adjust it safely with your doctor. Please come straight back if you feel faint or fall.",
  "Um... hi, so, like, what's the problem today?",
  "Uh, ok, and when did it, um, start I guess?",
  'Are you taking your medications properly?',
  'Why did you stop taking it?',
  "Ok um, I don't know, like, maybe we'll just do some tests or something.",
  'Hi David, what brings you in today?',
  'When did the dizziness start?',
  "I'm sorry, that came out wrong. Let me ask differently.",
  "Many people stop or change their medications because of side effects, and that's completely understandable. Has anything like that happened to you recently?",
  "Thank you for telling me — that's really helpful and nothing to worry about. We'll sort it out together.",
  // starter prompts + guided buttons
  "Hello David, my name is Maya, I'm a medical student. What brings you in today?",
  'When did the dizziness start, and is it worse in any position?',
  'Are you having any weakness, slurred speech, or fainting?',
  'Can you tell me which medications you take?',
]

mkdirSync(audioDir, { recursive: true })
mkdirSync(tmpDir, { recursive: true })

console.log('loading Kokoro model…')
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' })
console.log('model ready.')

const ids = new Set()

async function render(lines, voice, label) {
  let n = 0
  for (const line of lines) {
    const id = voiceId(line)
    n++
    if (ids.has(id)) continue
    ids.add(id)
    const mp3 = join(audioDir, id + '.mp3')
    if (existsSync(mp3)) {
      console.log(`skip ${label} ${id}`)
      continue
    }
    const wav = join(tmpDir, id + '.wav')
    const audio = await tts.generate(speakable(line), { voice })
    await audio.save(wav)
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '4', mp3])
    rmSync(wav, { force: true })
    console.log(`ok   ${label} ${id}  ${n}/${lines.length}  "${line.slice(0, 42)}…"`)
  }
}

await render(davidLines, 'bm_george', 'DAVID')
await render(mayaLines, 'af_heart', 'MAYA ')

rmSync(tmpDir, { recursive: true, force: true })
writeFileSync(join(root, 'src', 'data', 'voiceManifest.json'), JSON.stringify([...ids], null, 2) + '\n')
console.log(`\nWrote ${ids.size} voice ids. David=bm_george, Maya=af_heart`)
