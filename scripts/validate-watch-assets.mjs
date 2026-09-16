import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultBuild, partCatalog } from '../src/data/watchParts.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const strictWebp = process.argv.includes('--strict-webp')
const expectedCanvas = { width: 1200, height: 1600 }
const allowedDerivedKinds = new Set(['case', 'dial', 'hands', 'strap-back', 'strap-front', 'crystal'])
const errors = []
const warnings = []
let standaloneAssets = 0
let derivedAssets = 0

function fail(message) { errors.push(message) }
function warn(message) { warnings.push(message) }

function resolvePublicAsset(webPath) {
  if (!webPath || typeof webPath !== 'string') return null
  if (!webPath.startsWith('/assets/')) {
    fail(`Asset path must begin with /assets/: ${webPath}`)
    return null
  }
  return path.join(root, 'public', webPath.replace(/^\//, ''))
}

function readWebPInfo(filePath) {
  const buffer = fs.readFileSync(filePath)
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('not a valid RIFF/WebP file')
  }

  const chunk = buffer.toString('ascii', 12, 16)
  if (chunk === 'VP8X') {
    const flags = buffer[20]
    const width = 1 + buffer.readUIntLE(24, 3)
    const height = 1 + buffer.readUIntLE(27, 3)
    return { width, height, alpha: Boolean(flags & 0x10) }
  }

  if (chunk === 'VP8 ') {
    const width = buffer.readUInt16LE(26) & 0x3fff
    const height = buffer.readUInt16LE(28) & 0x3fff
    return { width, height, alpha: false }
  }

  if (chunk === 'VP8L') {
    const b0 = buffer[21]
    const b1 = buffer[22]
    const b2 = buffer[23]
    const b3 = buffer[24]
    const width = 1 + (((b1 & 0x3f) << 8) | b0)
    const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | (b1 >> 6))
    return { width, height, alpha: true }
  }

  throw new Error(`unsupported WebP chunk ${chunk}`)
}

function validateStandaloneAsset(owner, webPath) {
  if (!webPath) return false
  standaloneAssets += 1
  const filePath = resolvePublicAsset(webPath)
  if (!filePath) return false
  if (!fs.existsSync(filePath)) {
    fail(`${owner}: missing ${webPath}`)
    return false
  }
  if (path.extname(filePath).toLowerCase() !== '.webp') {
    fail(`${owner}: production layer must be WebP (${webPath})`)
    return false
  }

  try {
    const info = readWebPInfo(filePath)
    if (info.width !== expectedCanvas.width || info.height !== expectedCanvas.height) {
      fail(`${owner}: expected ${expectedCanvas.width}x${expectedCanvas.height}, got ${info.width}x${info.height} (${webPath})`)
    }
    if (!info.alpha) {
      fail(`${owner}: layer requires transparency (${webPath})`)
    }
  } catch (error) {
    fail(`${owner}: ${error.message} (${webPath})`)
  }
  return true
}

function validateDerived(owner, spec) {
  if (!spec) return false
  derivedAssets += 1
  if (!allowedDerivedKinds.has(spec.kind)) {
    fail(`${owner}: unknown source-derived kind ${spec.kind}`)
  }
  if (strictWebp) {
    fail(`${owner}: still uses source-derived prototype instead of standalone 1200x1600 WebP`)
  }
  return true
}

function validatePart(part) {
  if (!part.id || !part.type || !part.name) fail('Every part requires id, type and name')
  if (part.assetKey && /\s/.test(part.assetKey)) fail(`${part.id}: assetKey cannot contain whitespace`)

  if (part.type === 'case' || part.type === 'dial' || part.type === 'hands' || part.type === 'caseback') {
    validateStandaloneAsset(`${part.id}.previewLayer`, part.previewLayer)
    if (part.sourceLayer) validateDerived(`${part.id}.sourceLayer`, part.sourceLayer)
  }

  if (part.type === 'strap') {
    validateStandaloneAsset(`${part.id}.backLayer`, part.backLayer)
    validateStandaloneAsset(`${part.id}.frontLayer`, part.frontLayer)
    if (part.sourceBackLayer) validateDerived(`${part.id}.sourceBackLayer`, part.sourceBackLayer)
    if (part.sourceFrontLayer) validateDerived(`${part.id}.sourceFrontLayer`, part.sourceFrontLayer)
    const hasBack = Boolean(part.backLayer || part.sourceBackLayer)
    const hasFront = Boolean(part.frontLayer || part.sourceFrontLayer)
    if (hasBack !== hasFront) fail(`${part.id}: strap front/back layers must be supplied as a pair`)
  }
}

for (const parts of Object.values(partCatalog)) {
  for (const part of parts) validatePart(part)
}

function getPart(type, id) {
  return partCatalog[type]?.find((part) => part.id === id)
}

const defaultCase = getPart('case', defaultBuild.case)
const defaultDial = getPart('dial', defaultBuild.dial)
const defaultHands = getPart('hands', defaultBuild.hands)
const defaultStrap = getPart('strap', defaultBuild.strap)

if (!defaultCase?.previewLayer && !defaultCase?.sourceLayer) fail('Default build case has no visual layer')
if (!defaultDial?.previewLayer && !defaultDial?.sourceLayer) fail('Default build dial has no visual layer')
if (!defaultHands?.previewLayer && !defaultHands?.sourceLayer) fail('Default build hands have no visual layer')
if ((!defaultStrap?.backLayer && !defaultStrap?.sourceBackLayer) || (!defaultStrap?.frontLayer && !defaultStrap?.sourceFrontLayer)) {
  fail('Default build strap requires both back and front visual layers')
}

if (!strictWebp && derivedAssets) {
  warn(`${derivedAssets} source-derived layer(s) are active for Phase 4 prototyping; run npm run validate:assets:strict before replacing them with production WebP assets.`)
}

for (const message of warnings) console.warn(`WARN  ${message}`)
for (const message of errors) console.error(`ERROR ${message}`)

console.log(`Asset validation: ${standaloneAssets} standalone path(s), ${derivedAssets} source-derived layer(s), ${errors.length} error(s).`)
process.exit(errors.length ? 1 : 0)
