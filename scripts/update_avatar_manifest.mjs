#!/usr/bin/env node
/**
 * Regenerates avatarManifest.json by scanning public/video/ for MP4 files.
 * Run after extracting the ZIP from Colab:
 *   node scripts/update_avatar_manifest.mjs
 */
import { readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir    = dirname(fileURLToPath(import.meta.url))
const videoDir = join(__dir, '../public/video')
const manifest = join(__dir, '../src/features/live-patient/lib/avatarManifest.json')

if (!existsSync(videoDir)) {
  console.error('public/video/ not found - create it and drop in the MP4s first')
  process.exit(1)
}

const ids = readdirSync(videoDir)
  .filter(f => f.endsWith('.mp4'))
  .map(f => f.replace('.mp4', ''))

writeFileSync(manifest, JSON.stringify(ids, null, 2) + '\n')
console.log(`Registered ${ids.length} videos in avatarManifest.json`)
ids.forEach(id => console.log(`  ${id}.mp4`))
