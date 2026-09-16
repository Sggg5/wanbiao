import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultBuild, partCatalog } from '../src/data/watchParts.js'
import { checkCompatibility, getInvalidSelections } from '../src/utils/compatibility.js'
import { BUILD_STATE_VERSION, serializeBuild } from '../src/utils/buildState.js'
import { sanitizeBuild } from '../src/utils/shareBuild.js'

test('default build is fully compatible', () => {
  assert.deepEqual(getInvalidSelections(defaultBuild), [])
})

test('NH35 configuration can be repaired to a valid build', () => {
  const repaired = sanitizeBuild({
    movement: 'seiko-nh35',
    case: 'case-classic-39',
    dial: 'dial-midnight-blue',
    hands: 'hands-dauphine',
    strap: 'strap-steel',
    caseback: 'caseback-exhibition',
  })

  assert.equal(repaired.movement, 'seiko-nh35')
  assert.equal(repaired.case, 'case-sport-40')
  assert.deepEqual(getInvalidSelections(repaired), [])
})

test('strap compatibility checks lug width', () => {
  const blackLeather = partCatalog.strap.find((part) => part.id === 'strap-black-leather')
  const build = {
    ...defaultBuild,
    movement: 'seiko-nh35',
    case: 'case-sport-40',
    dial: 'dial-obsidian-black',
    hands: 'hands-baton',
    caseback: 'caseback-solid',
  }
  const result = checkCompatibility(blackLeather, build)
  assert.equal(result.compatible, false)
  assert.ok(result.reasons.includes('MOVEMENT_MISMATCH'))
  assert.ok(result.reasons.includes('LUG_WIDTH_MISMATCH'))
})

test('serialized builds carry a version', () => {
  const value = serializeBuild(defaultBuild)
  assert.equal(value.v, BUILD_STATE_VERSION)
  assert.equal(value.m, defaultBuild.movement)
  assert.equal(value.c, defaultBuild.case)
})
