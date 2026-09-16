<template>
  <Transition name="layer-swap" mode="out-in">
    <div
      :key="keyValue"
      class="watch-layer"
      :class="[`layer-${layer}`, keyValue, { 'has-image': loaded }]"
    >
      <SourceDerivedLayer
        v-if="sourceLayer && !src"
        :spec="sourceLayer"
      />
      <img
        v-else-if="src && !failed"
        :src="src"
        alt=""
        @load="handleLoad"
        @error="handleError"
      />
      <span
        v-if="layer === 'dial' && color !== 'transparent'"
        class="dial-surface"
        :style="{ '--dial': color }"
      />
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import SourceDerivedLayer from './SourceDerivedLayer.vue'

const props = defineProps({
  layer: String,
  src: String,
  sourceLayer: Object,
  color: { type: String, default: 'transparent' },
  keyValue: String,
})

const emit = defineEmits(['loaded'])
const loaded = ref(false)
const failed = ref(false)

function reset() {
  failed.value = false
  loaded.value = Boolean(props.sourceLayer && !props.src)
  emit('loaded', loaded.value)
}

function handleLoad() {
  loaded.value = true
  failed.value = false
  emit('loaded', true)
}

function handleError() {
  loaded.value = false
  failed.value = true
  emit('loaded', false)
}

watch(
  () => [props.src, props.keyValue, props.sourceLayer?.kind, props.sourceLayer?.variant],
  reset,
  { immediate: true },
)
</script>
