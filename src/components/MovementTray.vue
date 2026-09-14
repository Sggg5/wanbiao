<template>
  <aside class="movement-tray" aria-label="Movement selection">
    <button v-for="movement in movements" :key="movement.id" class="movement" :class="{ selected: movement.id === store.selectedMovement, dragging: drag?.dragPart?.id===movement.id }" @pointerdown="drag?.begin($event,movement)" @click="store.selectMovement(movement.id)">
      <span class="movement-disc" :class="movement.tone"><i /><b /><em /></span><span><strong>{{ movement.code }}</strong><small>{{ movement.spec }}</small></span>
    </button>
  </aside>
</template>
<script setup>import { movements } from '../data/watchParts'; import { useWatchBuilderStore } from '../stores/watchBuilder'; defineProps({drag:Object}); const store=useWatchBuilderStore()</script>
