<template>
  <aside class="movement-tray" aria-label="机芯选择">
    <button
      v-for="movement in movements"
      :key="movement.id"
      class="movement"
      :class="{ selected: movement.id === store.selectedMovement, dragging: drag?.dragPart?.id === movement.id }"
      :aria-pressed="movement.id === store.selectedMovement"
      :aria-label="`${movement.name}，${movement.frequency}`"
      @pointerdown="drag?.begin($event, movement)"
      @click="selectMovement(movement)"
    >
      <span class="movement-disc" :class="movement.tone"><i /><b /><em /></span>
      <span><strong>{{ movement.model }}</strong><small>{{ movement.frequency }}</small></span>
    </button>
  </aside>
</template>

<script setup>
import { movements } from '../data/watchParts'
import { useWatchBuilderStore } from '../stores/watchBuilder'

const props = defineProps({ drag: Object })
const store = useWatchBuilderStore()

function selectMovement(movement) {
  if (props.drag?.consumeClick?.()) return
  store.selectMovement(movement.id)
}
</script>
