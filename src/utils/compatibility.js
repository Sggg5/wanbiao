import { partCatalog } from '../data/watchParts.js'

const findPart = (type, id) => (partCatalog[type] || []).find((part) => part.id === id)

const sameHandSize = (a, b) => {
  if (!a || !b) return true
  return ['hour', 'minute', 'second'].every((key) => Math.abs((a[key] || 0) - (b[key] || 0)) < 0.001)
}

export function checkCompatibility(part, build) {
  if (!part) return { compatible: false, reasons: ['UNKNOWN_PART'] }
  if (part.type === 'movement') return { compatible: true, reasons: [] }

  const reasons = []
  const movement = findPart('movement', build.movement)
  const watchCase = findPart('case', build.case)

  if (part.compatibleMovements && !part.compatibleMovements.includes(build.movement)) {
    reasons.push('MOVEMENT_MISMATCH')
  }

  if (part.type === 'dial' && watchCase?.dialDiameter && part.diameter) {
    if (Math.abs(watchCase.dialDiameter - part.diameter) > 0.05) reasons.push('DIAL_DIAMETER_MISMATCH')
  }

  if (part.type === 'hands' && movement?.handSize) {
    const supported = part.handSizes || (part.handSize ? [part.handSize] : [])
    if (supported.length && !supported.some((size) => sameHandSize(movement.handSize, size))) {
      reasons.push('HAND_SIZE_MISMATCH')
    }
  }

  if (part.type === 'strap' && watchCase?.lugWidth && part.lugWidths) {
    if (!part.lugWidths.includes(watchCase.lugWidth)) reasons.push('LUG_WIDTH_MISMATCH')
  }

  if (part.type === 'caseback' && part.compatibleCases && !part.compatibleCases.includes(build.case)) {
    reasons.push('CASEBACK_CASE_MISMATCH')
  }

  return { compatible: reasons.length === 0, reasons }
}

export function isCompatible(part, build) {
  return checkCompatibility(part, build).compatible
}

export function getCompatibleParts(type, build) {
  return (partCatalog[type] || []).filter((part) => isCompatible(part, build))
}

export function getInvalidSelections(build) {
  return ['case', 'dial', 'hands', 'strap', 'caseback'].filter((type) => {
    const id = build[type]
    if (!id) return false
    const part = findPart(type, id)
    return !part || !isCompatible(part, build)
  })
}
