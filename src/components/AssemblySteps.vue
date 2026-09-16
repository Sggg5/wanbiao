<template>
  <nav class="assembly-steps" aria-label="Assembly steps">
    <button
      v-for="step in steps"
      :key="step.id"
      :class="{ active: store.activeStep === step.id, complete: store.isStepComplete(step.id) }"
      :aria-current="store.activeStep === step.id ? 'step' : undefined"
      :aria-label="`${step.label}${store.isStepComplete(step.id) ? ', completed' : ''}`"
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
  { id: 'movement', label: 'MOVEMENT' },
  { id: 'case', label: 'CASE' },
  { id: 'dial', label: 'DIAL' },
  { id: 'hands', label: 'HANDS' },
  { id: 'strap', label: 'STRAP' },
  { id: 'caseback', label: 'BACK' },
]
</script>
