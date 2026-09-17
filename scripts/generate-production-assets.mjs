import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'public/assets/atelier-watch-placeholder.png')
const pythonScript = path.join(root, 'scripts/generate-production-assets.py')
const manifestPath = path.join(root, 'public/assets/parts/production-manifest.json')

if (!fs.existsSync(source)) throw new Error(`Missing source watch render: ${source}`)

let generated = false
for (const python of ['python', 'python3']) {
  const result = spawnSync(python, [pythonScript], { cwd: root, stdio: 'inherit' })
  if (!result.error && result.status === 0) {
    generated = true
    break
  }
  if (result.error?.code !== 'ENOENT') process.stderr.write(`${python} asset generation failed.\n`)
}
if (!generated) {
  throw new Error('Could not generate production watch assets. Install Python 3 and Pillow (`python -m pip install Pillow`).')
}

const manifest = {
  canvas: { width: 1200, height: 1600 },
  source: '/assets/atelier-watch-placeholder.png',
  generator: 'scripts/generate-production-assets.py',
  required: [
    '/assets/parts/cases/classic-39.webp',
    '/assets/parts/dials/midnight-blue.webp',
    '/assets/parts/dials/obsidian-black.webp',
    '/assets/parts/dials/silver-grain.webp',
    '/assets/parts/hands/dauphine.webp',
    '/assets/parts/straps/steel-back.webp',
    '/assets/parts/straps/steel-front.webp',
    '/assets/parts/straps/black-leather-back.webp',
    '/assets/parts/straps/black-leather-front.webp',
    '/assets/parts/common/crystal-highlight.webp',
  ],
}

fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Wrote ${path.relative(root, manifestPath)}`)
