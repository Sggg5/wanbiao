import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { defaultBuild, partCatalog } from '../data/watchParts'
import { checkCompatibility, getCompatibleParts, getInvalidSelections } from '../utils/compatibility'
import { serializeBuild } from '../utils/buildState'
import { sanitizeBuild } from '../utils/shareBuild'

const lookup = (type, id) => (partCatalog[type] || []).find((part) => part.id === id)
const TYPES = ['movement', 'case', 'dial', 'hands', 'strap', 'caseback']

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

    refsByType[type].value = id
    markComplete(type)
    return { status: 'installed', part }
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

    selectedMovement.value = pendingMovement.value.id
    const resetTypes = [...pendingMovement.value.invalid]

    for (const type of ['case', 'dial', 'hands', 'strap', 'caseback']) {
      if (!resetTypes.includes(type)) continue
      const compatible = getCompatibleParts(type, build.value)[0]
      refsByType[type].value = compatible?.id || null
    }

    markComplete('movement')
    pendingMovement.value = null
    return { status: 'installed', part: lookup('movement', selectedMovement.value) }
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
    selectedMovement.value = defaultBuild.movement
    selectedCase.value = defaultBuild.case
    selectedDial.value = defaultBuild.dial
    selectedHands.value = defaultBuild.hands
    selectedStrap.value = defaultBuild.strap
    selectedCaseback.value = defaultBuild.caseback
    activeStep.value = 'dial'
    completedSteps.value = ['movement', 'case']
    pendingMovement.value = null
  }

  function hydrateBuild(next) {
    const sanitized = sanitizeBuild(next)
    selectedMovement.value = sanitized.movement
    selectedCase.value = sanitized.case
    selectedDial.value = sanitized.dial
    selectedHands.value = sanitized.hands
    selectedStrap.value = sanitized.strap
    selectedCaseback.value = sanitized.caseback
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
