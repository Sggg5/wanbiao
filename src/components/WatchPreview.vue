<template>
  <div ref="stage" class="watch-stage" @pointermove="tilt" @pointerleave="resetTilt">
    <div class="watch-shadow" :style="{ transform: `translate(${pointer.x * 7}px,${pointer.y * 9}px)` }" />
    <div
      v-if="drag?.isDragging && compatibleDrag"
      class="install-ring"
      :class="{ visible: drag.isOverInstallZone }"
      :style="zoneStyle"
    >
      <span v-if="drag.isOverInstallZone">PLACE TO INSTALL</span>
    </div>

    <div class="watch-preview" :style="watchStyle">
      <img
        class="watch-image fallback-watch"
        :class="{ 'composite-ready': hasRealComposite }"
        src="/assets/atelier-watch-placeholder.png"
        alt="Custom steel watch preview"
      />

      <WatchLayer
        layer="strap-back"
        :src="strap?.backLayer"
        :key-value="strap?.id"
        @loaded="setLayerLoaded('strap-back', $event)"
      />
      <WatchLayer
        layer="case"
        :src="watchCase?.previewLayer"
        :key-value="watchCase?.id"
        @loaded="setLayerLoaded('case', $event)"
      />
      <WatchLayer
        layer="dial"
        :src="dial?.previewLayer"
        :color="dial?.color"
        :key-value="dial?.id"
        @loaded="setLayerLoaded('dial', $event)"
      />
      <WatchLayer
        layer="hands"
        :src="watchHands?.previewLayer"
        :key-value="watchHands?.id"
        @loaded="setLayerLoaded('hands', $event)"
      />
      <WatchLayer layer="crystal" key-value="crystal" @loaded="setLayerLoaded('crystal', $event)" />
      <WatchLayer
        layer="strap-front"
        :src="strap?.frontLayer"
        :key-value="strap?.id"
        @loaded="setLayerLoaded('strap-front', $event)"
      />
      <div class="crystal-highlight" :style="{ transform: `translate(${pointer.x * 16}px,${pointer.y * 14}px)` }" />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWatchBuilderStore } from '../stores/watchBuilder'
import { partCatalog } from '../data/watchParts'
import WatchLayer from './watch/WatchLayer.vue'
import { installZones } from '../config/installZones'
import { checkCompatibility } from '../utils/compatibility'

const props = defineProps({ drag: Object })
const stage = ref(null)
const store = useWatchBuilderStore()
const { build } = storeToRefs(store)
const part = (type) => computed(() => partCatalog[type].find((item) => item.id === build.value[type]) || null)
const dial = part('dial')
const watchCase = part('case')
const watchHands = part('hands')
const strap = part('strap')

const pointer = reactive({ x: 0, y: 0 })
const loadedLayers = reactive({
  'strap-back': false,
  case: false,
  dial: false,
  hands: false,
  crystal: false,
  'strap-front': false,
})

const requiredCompositeLayers = ['strap-back', 'case', 'dial', 'hands', 'strap-front']
const hasRealComposite = computed(() => requiredCompositeLayers.every((key) => loadedLayers[key]))

const watchStyle = computed(() => ({
  '--rx': `${-pointer.y * 3}deg`,
  '--ry': `${pointer.x * 5}deg`,
}))

const reducedMotionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
let tiltFrame = 0

function setLayerLoaded(layer, loaded) {
  loadedLayers[layer] = loaded
}

function tilt(event) {
  if (reducedMotionQuery?.matches) return
  const rect = event.currentTarget.getBoundingClientRect()
  const nextX = (event.clientX - rect.left) / rect.width * 2 - 1
  const nextY = (event.clientY - rect.top) / rect.height * 2 - 1
  cancelAnimationFrame(tiltFrame)
  tiltFrame = requestAnimationFrame(() => {
    pointer.x = nextX
    pointer.y = nextY
  })
}

function resetTilt() {
  cancelAnimationFrame(tiltFrame)
  pointer.x = 0
  pointer.y = 0
}

const compatibleDrag = computed(() => {
  const draggedPart = props.drag?.dragPart
  return Boolean(draggedPart && checkCompatibility(draggedPart, build.value).compatible)
})

const zoneStyle = computed(() => {
  const zone = installZones[props.drag?.dragPart?.type] || installZones.case
  return {
    left: `${zone.x * 100}%`,
    top: `${zone.y * 100}%`,
    width: `${zone.radius * 200}%`,
    aspectRatio: '1',
  }
})

function installTarget(point, draggedPart) {
  if (!stage.value || !draggedPart) return { accepted: false, reason: 'invalid' }

  const compatibility = checkCompatibility(draggedPart, build.value)
  if (!compatibility.compatible) {
    return { accepted: false, reason: 'incompatible', reasons: compatibility.reasons }
  }

  const rect = stage.value.getBoundingClientRect()
  const x = (point.x - rect.left) / rect.width
  const y = (point.y - rect.top) / rect.height
  const zone = installZones[draggedPart.type]
  if (!zone) return { accepted: false, reason: 'wrong-zone' }

  const inZone = (target) => Math.hypot(x - target.x, y - target.y) <= target.radius
  const accepted = inZone(zone) || Boolean(zone.secondary && inZone(zone.secondary))
  return { accepted, reason: accepted ? null : 'wrong-zone' }
}

onBeforeUnmount(() => cancelAnimationFrame(tiltFrame))
defineExpose({ installTarget })
</script>
