import { computed, onBeforeUnmount, ref } from 'vue'

export function usePartDrag({ getInstallTarget, onInstall, onInvalid }) {
  const isDragging = ref(false)
  const dragPart = ref(null)
  const dragPosition = ref({ x: 0, y: 0 })
  const dragOffset = ref({ x: 0, y: 0 })
  const isOverInstallZone = ref(false)
  let start = null; let moved = false; let frame = 0
  const ghostStyle = computed(() => ({ transform: `translate3d(${dragPosition.value.x - dragOffset.value.x}px, ${dragPosition.value.y - dragOffset.value.y}px, 0)` }))
  function point(event) { return { x: event.clientX, y: event.clientY } }
  function update(event) {
    const next = point(event)
    moved ||= Math.hypot(next.x - start.x, next.y - start.y) > 5
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => { dragPosition.value = next; isOverInstallZone.value = !!getInstallTarget(next, dragPart.value) })
  }
  function finish(event) {
    const next = point(event); const target = moved && getInstallTarget(next, dragPart.value)
    if (target) onInstall(dragPart.value)
    else if (moved) onInvalid(dragPart.value)
    isDragging.value = false; dragPart.value = null; isOverInstallZone.value = false
    document.removeEventListener('pointermove', update); document.removeEventListener('pointerup', finish)
  }
  function begin(event, part) {
    if (event.button !== undefined && event.button !== 0) return
    start = point(event); moved = false; dragPart.value = part; dragPosition.value = start
    const box = event.currentTarget.getBoundingClientRect(); dragOffset.value = { x: box.width / 2, y: box.height / 2 }
    isDragging.value = true
    document.addEventListener('pointermove', update); document.addEventListener('pointerup', finish, { once: true })
  }
  onBeforeUnmount(() => { cancelAnimationFrame(frame); document.removeEventListener('pointermove', update); document.removeEventListener('pointerup', finish) })
  return { isDragging, dragPart, dragPosition, dragOffset, isOverInstallZone, ghostStyle, begin }
}
