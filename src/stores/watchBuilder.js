import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { defaultBuild, partCatalog } from '../data/watchParts.js'
import { checkCompatibility, getCompatibleParts, getInvalidSelections } from '../utils/compatibility.js'
import { serializeBuild } from '../utils/buildState.js'
import { sanitizeBuild } from '../utils/shareBuild.js'

const lookup = (type, id) => (partCatalog[type] || []).find((part) => part.id === id)
const TYPES = ['movement', 'case', 'dial', 'hands', 'strap', 'caseback']
const DEPENDENT_TYPES = ['case', 'dial', 'hands', 'strap', 'caseback']

export const useWatchBuilderStore = defineStore('watchBuilder', () => {
  const selectedMovement = ref(defaultBuild.movement)
  const selectedCase = ref(defaultBuild.case)
  const selectedDial = ref(defaultBuild.dial)
  const selectedHands = ref(defaultBuild.hands)
  const selectedStrap = ref(defaultBuild.strap)
  const selectedCaseback = ref(defaultBuild.caseback)
  const activeStep = ref('dial')
  const completedSteps = ref(['movement', 'case'])
  const buildNumber = ref('00127')
  const pendingMovement = ref(null)

  const refsByType = {
    movement: selectedMovement,
    case: selectedCase,
    dial: selectedDial,
    hands: selectedHands,
    strap: selectedStrap,
    caseback: selectedCaseback,
  }

  const build = computed(() => ({
    movement: selectedMovement.value,
    case: selectedCase.value,
    dial: selectedDial.value,
    hands: selectedHands.value,
    strap: selectedStrap.value,
    caseback: selectedCaseback.value,
  }))

  const currentCompatibility = computed(() => getInvalidSelections(build.value))
  const totalPrice = computed(() => TYPES.reduce((sum, type) => sum + (lookup(type, build.value[type])?.price || 0), 0))
  const buildSummary = computed(() => ({
    movement: lookup('movement', selectedMovement.value),
    case: lookup('case', selectedCase.value),
    dial: lookup('dial', selectedDial.value),
    hands: lookup('hands', selectedHands.value),
    strap: lookup('strap', selectedStrap.value),
    caseback: lookup('caseback', selectedCaseback.value),
    total: totalPrice.value,
    buildNumber: buildNumber.value,
  }))

  function markComplete(type) {
    if (!completedSteps.value.includes(type)) completedSteps.value.push(type)
  }

  function markIncomplete(types = []) {
    if (!types.length) return
    completedSteps.value = completedSteps.value.filter((step) => !types.includes(step))
  }

  function applyBuild(next) {
    for (const type of TYPES) refsByType[type].value = next[type]
  }

  function repairDependents(candidate, preserveType = null) {
    const next = { ...candidate }
    const repaired = []

    for (const type of DEPENDENT_TYPES) {
      const part = lookup(type, next[type])
      if (part && checkCompatibility(part, next).compatible) continue
      if (type === preserveType) return { valid: false, build: next, repaired }
      const replacement = getCompatibleParts(type, next)[0]
      next[type] = replacement?.id || null
      repaired.push(type)
    }

    return { valid: getInvalidSelections(next).length === 0, build: next, repaired }
  }

  function setSelection(type, id) {
    if (!TYPES.includes(type)) return { status: 'invalid', reason: 'UNKNOWN_TYPE' }
    if (type === 'movement') return selectMovement(id)

    const part = lookup(type, id)
    if (!part) return { status: 'invalid', reason: 'UNKNOWN_PART' }

    const next = { ...build.value, [type]: id }
    const compatibility = checkCompatibility(part, next)
    if (!compatibility.compatible) {
      return { status: 'incompatible', reasons: compatibility.reasons }
    }

    const repaired = repairDependents(next, type)
    if (!repaired.valid) return { status: 'incompatible', reasons: ['DEPENDENCY_MISMATCH'] }

    applyBuild(repaired.build)
    markComplete(type)
    markIncomplete(repaired.repaired)
    return { status: 'installed', part, repaired: repaired.repaired }
  }

  function selectMovement(id) {
    const movement = lookup('movement', id)
    if (!movement) return { status: 'invalid', reason: 'UNKNOWN_PART' }

    const next = { ...build.value, movement: id }
    const invalid = getInvalidSelections(next)
    if (invalid.length) {
      pendingMovement.value = { id, invalid }
      return { status: 'pending', invalid }
    }

    selectedMovement.value = id
    markComplete('movement')
    return { status: 'installed', part: movement }
  }

  function confirmMovement() {
    if (!pendingMovement.value) return { status: 'idle' }

    const candidate = { ...build.value, movement: pendingMovement.value.id }
    const repaired = repairDependents(candidate)
    if (!repaired.valid) {
      pendingMovement.value = null
      return { status: 'invalid', reason: 'NO_COMPATIBLE_BUILD' }
    }

    applyBuild(repaired.build)
    markComplete('movement')
    markIncomplete(repaired.repaired)
    pendingMovement.value = null
    return { status: 'installed', part: lookup('movement', selectedMovement.value), repaired: repaired.repaired }
  }

  function cancelMovement() {
    pendingMovement.value = null
  }

  const selectCase = (id) => setSelection('case', id)
  const selectDial = (id) => setSelection('dial', id)
  const selectHands = (id) => setSelection('hands', id)
  const selectStrap = (id) => setSelection('strap', id)
  const selectCaseback = (id) => setSelection('caseback', id)

  function goToStep(step) {
    if (TYPES.includes(step)) activeStep.value = step
  }

  function isStepComplete(step) {
    return completedSteps.value.includes(step)
  }

  function resetBuild() {
    applyBuild(defaultBuild)
    activeStep.value = 'dial'
    completedSteps.value = ['movement', 'case']
    pendingMovement.value = null
  }

  function hydrateBuild(next) {
    applyBuild(sanitizeBuild(next))
    pendingMovement.value = null
  }

  return {
    selectedMovement,
    selectedCase,
    selectedDial,
    selectedHands,
    selectedStrap,
    selectedCaseback,
    activeStep,
    completedSteps,
    buildNumber,
    pendingMovement,
    totalPrice,
    currentCompatibility,
    buildSummary,
    build,
    setSelection,
    selectMovement,
    confirmMovement,
    cancelMovement,
    selectCase,
    selectDial,
    selectHands,
    selectStrap,
    selectCaseback,
    goToStep,
    isStepComplete,
    resetBuild,
    hydrateBuild,
    serializeBuild: () => serializeBuild(build.value),
  }
})
