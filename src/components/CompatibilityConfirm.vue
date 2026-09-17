<template>
  <div
    v-if="store.pendingMovement"
    class="compatibility-confirm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="movement-confirm-title"
  >
    <div>
      <p id="movement-confirm-title">更换机芯？</p>
      <span>此操作将重置：</span>
      <strong>{{ formatInvalid(store.pendingMovement.invalid) }}</strong>
      <footer>
        <button @click="store.cancelMovement">取消</button>
        <button @click="store.confirmMovement">继续</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useWatchBuilderStore } from '../stores/watchBuilder'
const store = useWatchBuilderStore()

const partLabels = {
  movement: '机芯',
  case: '表壳',
  dial: '表盘',
  hands: '指针',
  strap: '表带',
  caseback: '底盖',
}

function formatInvalid(parts) {
  return parts.map((part) => partLabels[part] || part).join(' · ')
}
</script>
