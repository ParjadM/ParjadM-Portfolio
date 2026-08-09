/**
 * Post-build guard: ensure the generated service worker does not precache
 * heavy optional route chunks and stays under a size budget.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
// App shell + small install icons (192 / apple-touch). Large 512px icons stay
// out of precache so we remain under budget; they load from the network/manifest
// when needed. Fail loudly if heavy route chunks return to precache.
const MAX_PRECACHE_BYTES = 700 * 1024
const FORBIDDEN = [
  'AlgorithmMemorizer',
  'AdminDashboard',
  'DesktopOS',
  'CliMode',
  'MockInterview',
  'IntroCinematic',
  'CameraFx',
]

function findSw() {
  const files = readdirSync(DIST)
  const sw = files.find((f) => f === 'sw.js' || f.startsWith('sw-'))
  if (!sw) throw new Error('No service worker found in dist/')
  return path.join(DIST, sw)
}

const swPath = findSw()
const sw = readFileSync(swPath, 'utf8')
const hits = FORBIDDEN.filter((name) => sw.includes(name))
if (hits.length) {
  console.error(`PWA precache includes forbidden chunks: ${hits.join(', ')}`)
  process.exit(1)
}

// Rough size: sum referenced asset files that exist under dist/
const urls = [...sw.matchAll(/["']([^"']+\.(?:js|css|webp|woff2|html|png|svg|webmanifest))["']/g)]
  .map((m) => m[1].replace(/^\//, ''))
let total = 0
for (const rel of new Set(urls)) {
  const abs = path.join(DIST, rel)
  try {
    total += statSync(abs).size
  } catch {
    // ignore missing / absolute CDN paths
  }
}

if (total > MAX_PRECACHE_BYTES) {
  console.error(`PWA precache ~${Math.round(total / 1024)} KiB exceeds ${Math.round(MAX_PRECACHE_BYTES / 1024)} KiB budget`)
  process.exit(1)
}

console.log(`PWA precache check OK (~${Math.round(total / 1024)} KiB, no forbidden chunks)`)
