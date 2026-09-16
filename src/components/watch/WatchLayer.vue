<template>
  <Transition name="layer-swap" mode="out-in">
    <div
      :key="keyValue"
      class="watch-layer"
      :class="[`layer-${layer}`, keyValue, { 'has-image': loaded }]"
    >
      <img
        v-if="src && !failed"
        :src="src"
        alt=""
        @load="handleLoad"
        @error="handleError"
      />
      <span
        v-if="layer === 'dial' && !loaded"
        class="dial-surface"
        :style="{ '--dial': color }"
      />
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  layer: String,
  src: String,
  color: { type: String, default: 'transparent' },
  keyValue: String,
})

const emit = defineEmits(['loaded'])
const loaded = ref(false)
const failed = ref(false)

function reset() {
  loaded.value = false
  failed.value = false
  emit('loaded', false)
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

watch(() => [props.src, props.keyValue], reset)
</script>
