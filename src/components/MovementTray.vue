<template>
  <aside class="movement-tray" aria-label="Movement selection">
    <button v-for="movement in movements" :key="movement.id" class="movement" :class="{ selected: movement.id === store.selectedMovement }" @click="store.selectMovement(movement.id)">
      <span class="movement-disc" :class="movement.tone"><i /><b /><em /></span><span><strong>{{ movement.code }}</strong><small>{{ movement.spec }}</small></span>
    </button>
  </aside>
</template>
<script setup>import { movements } from '../data/watchParts'; import { useWatchBuilderStore } from '../stores/watchBuilder'; const store=useWatchBuilderStore()</script>
