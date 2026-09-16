import test from 'node:test'
import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import { defaultBuild, partCatalog } from '../src/data/watchParts.js'
import { useWatchBuilderStore } from '../src/stores/watchBuilder.js'
import { checkCompatibility, getInvalidSelections } from '../src/utils/compatibility.js'
import { BUILD_STATE_VERSION, serializeBuild } from '../src/utils/buildState.js'
import { sanitizeBuild } from '../src/utils/shareBuild.js'

test('default build is fully compatible', () => {
  assert.deepEqual(getInvalidSelections(defaultBuild), [])
})

test('NH35 configuration can be repaired to a valid build while preserving compatible choices', () => {
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
  assert.equal(repaired.dial, 'dial-obsidian-black')
  assert.equal(repaired.strap, 'strap-steel')
  assert.equal(repaired.caseback, 'caseback-solid')
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

test('store rejects unknown part ids without mutating the build', () => {
  setActivePinia(createPinia())
  const store = useWatchBuilderStore()
  const before = { ...store.build }

  const result = store.selectDial('missing-dial')

  assert.equal(result.status, 'invalid')
  assert.deepEqual(store.build, before)
})

test('movement changes stay pending until confirmed and repair invalid dependents', () => {
  setActivePinia(createPinia())
  const store = useWatchBuilderStore()

  const pending = store.selectMovement('seiko-nh35')
  assert.equal(pending.status, 'pending')
  assert.equal(store.selectedMovement, 'miyota-9015')

  const confirmed = store.confirmMovement()
  assert.equal(confirmed.status, 'installed')
  assert.equal(store.selectedMovement, 'seiko-nh35')
  assert.equal(store.selectedCase, 'case-sport-40')
  assert.deepEqual(getInvalidSelections(store.build), [])
})
