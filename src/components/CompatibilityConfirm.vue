<template>
  <div
    v-if="store.pendingMovement"
    class="compatibility-confirm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="movement-confirm-title"
  >
    <div>
      <p id="movement-confirm-title">CHANGE MOVEMENT?</p>
      <span>This change will reset:</span>
      <strong>{{ store.pendingMovement.invalid.join(' · ').toUpperCase() }}</strong>
      <footer>
        <button @click="store.cancelMovement">CANCEL</button>
        <button @click="store.confirmMovement">CONTINUE</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useWatchBuilderStore } from '../stores/watchBuilder'
const store = useWatchBuilderStore()
</script>
