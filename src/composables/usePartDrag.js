import { computed, onBeforeUnmount, ref } from 'vue'

const normalizeTarget = (result) => {
  if (typeof result === 'boolean') return { accepted: result, reason: result ? null : 'wrong-zone' }
  return result || { accepted: false, reason: 'wrong-zone' }
}

export function usePartDrag({ getInstallTarget, onInstall, onInvalid }) {
  const isDragging = ref(false)
  const dragPart = ref(null)
  const dragPosition = ref({ x: 0, y: 0 })
  const dragOffset = ref({ x: 0, y: 0 })
  const isOverInstallZone = ref(false)

  let start = null
  let moved = false
  let frame = 0
  let pointerId = null
  let sourceEl = null
  let suppressClickUntil = 0

  const ghostStyle = computed(() => ({
    transform: `translate3d(${dragPosition.value.x - dragOffset.value.x}px, ${dragPosition.value.y - dragOffset.value.y}px, 0)`,
  }))

  function point(event) {
    return { x: event.clientX, y: event.clientY }
  }

  function cleanup() {
    cancelAnimationFrame(frame)
    document.removeEventListener('pointermove', update)
    document.removeEventListener('pointerup', finish)
    document.removeEventListener('pointercancel', cancel)
    window.removeEventListener('blur', cancel)
    if (sourceEl && pointerId !== null && sourceEl.hasPointerCapture?.(pointerId)) {
      sourceEl.releasePointerCapture?.(pointerId)
    }
    sourceEl = null
    pointerId = null
    start = null
  }

  function update(event) {
    if (!isDragging.value || (pointerId !== null && event.pointerId !== pointerId) || !start) return
    const next = point(event)
    moved ||= Math.hypot(next.x - start.x, next.y - start.y) > 5
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      dragPosition.value = next
      const target = normalizeTarget(getInstallTarget(next, dragPart.value))
      isOverInstallZone.value = target.accepted
    })
  }

  function finish(event) {
    if (!isDragging.value || (pointerId !== null && event.pointerId !== pointerId)) return
    const part = dragPart.value
    const next = point(event)
    const target = moved ? normalizeTarget(getInstallTarget(next, part)) : { accepted: false, reason: 'click' }

    try {
      if (moved && target.accepted) onInstall(part)
      else if (moved) onInvalid(part, target.reason || 'wrong-zone')
      if (moved) suppressClickUntil = performance.now() + 250
    } finally {
      isDragging.value = false
      dragPart.value = null
      isOverInstallZone.value = false
      cleanup()
    }
  }

  function cancel() {
    if (!isDragging.value) return
    isDragging.value = false
    dragPart.value = null
    isOverInstallZone.value = false
    suppressClickUntil = performance.now() + 250
    cleanup()
  }

  function begin(event, part) {
    if (event.button !== undefined && event.button !== 0) return
    start = point(event)
    moved = false
    pointerId = event.pointerId ?? null
    sourceEl = event.currentTarget
    sourceEl?.setPointerCapture?.(pointerId)
    dragPart.value = part
    dragPosition.value = start
    const box = event.currentTarget.getBoundingClientRect()
    dragOffset.value = { x: box.width / 2, y: box.height / 2 }
    isDragging.value = true

    document.addEventListener('pointermove', update)
    document.addEventListener('pointerup', finish)
    document.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', cancel)
  }

  function consumeClick() {
    return performance.now() < suppressClickUntil
  }

  onBeforeUnmount(cleanup)

  return {
    isDragging,
    dragPart,
    dragPosition,
    dragOffset,
    isOverInstallZone,
    ghostStyle,
    begin,
    cancel,
    consumeClick,
  }
}
