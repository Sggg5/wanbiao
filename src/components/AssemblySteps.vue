<template>
  <nav class="assembly-steps" aria-label="装配步骤">
    <button
      v-for="step in steps"
      :key="step.id"
      :class="{ active: store.activeStep === step.id, complete: store.isStepComplete(step.id) }"
      :aria-current="store.activeStep === step.id ? 'step' : undefined"
      :aria-label="`${step.label}${store.isStepComplete(step.id) ? '，已完成' : ''}`"
      @click="store.goToStep(step.id)"
    >
      <i>{{ store.activeStep === step.id ? '●' : store.isStepComplete(step.id) ? '✓' : '·' }}</i>
      <span>{{ step.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { useWatchBuilderStore } from '../stores/watchBuilder'

const store = useWatchBuilderStore()
const steps = [
  { id: 'movement', label: '机芯' },
  { id: 'case', label: '表壳' },
  { id: 'dial', label: '表盘' },
  { id: 'hands', label: '指针' },
  { id: 'strap', label: '表带' },
  { id: 'caseback', label: '底盖' },
]
</script>
