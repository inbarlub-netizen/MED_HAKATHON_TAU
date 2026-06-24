/**
 * Downloads a Ready Player Me avatar GLB to public/avatar/david-3d.glb
 * Run once: node scripts/download-avatar.mjs
 *
 * The avatar ID can be replaced with any RPM avatar ID.
 * Create your own at https://readyplayer.me
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dir, '..', 'public', 'avatar', 'david-3d.glb')

const AVATAR_ID = '64bfa15f0e72c63d7c3934a6'
const URL =
  `https://models.readyplayer.me/${AVATAR_ID}.glb` +
  '?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown' +
  '&textureSizeLimit=1024&textureFormat=png'

console.log('Downloading avatar from Ready Player Me...')
console.log(URL)

const resp = await fetch(URL)
if (!resp.ok) {
  console.error(`Failed: HTTP ${resp.status}`)
  console.error('Try creating your own avatar at https://readyplayer.me and updating AVATAR_ID')
  process.exit(1)
}

mkdirSync(join(__dir, '..', 'public', 'avatar'), { recursive: true })
const buf = await resp.arrayBuffer()
writeFileSync(OUT, Buffer.from(buf))
console.log(`Saved ${buf.byteLength} bytes to public/avatar/david-3d.glb`)
console.log('Done! The 3D avatar will now load locally.')
