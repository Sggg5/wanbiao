import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'public/assets/atelier-watch-placeholder.png')
const manifestPath = path.join(root, 'public/assets/parts/production-manifest.json')

if (!fs.existsSync(source)) {
  throw new Error(`Missing source watch render: ${source}`)
}

const manifest = {
  canvas: { width: 1200, height: 1600 },
  source: '/assets/atelier-watch-placeholder.png',
  required: [
    '/assets/parts/cases/classic-39.webp',
    '/assets/parts/dials/midnight-blue.webp',
    '/assets/parts/dials/obsidian-black.webp',
    '/assets/parts/dials/silver-grain.webp',
    '/assets/parts/hands/dauphine.webp',
    '/assets/parts/straps/steel-back.webp',
    '/assets/parts/straps/steel-front.webp',
    '/assets/parts/common/crystal-highlight.webp',
  ],
}

fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Wrote ${path.relative(root, manifestPath)}`)
console.log('Binary production layers are committed separately; run npm run validate:assets:strict to verify them.')
