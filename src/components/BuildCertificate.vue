<template>
  <section class="build-certificate" aria-label="Watch build certificate">
    <p>ATELIER TIME</p>
    <h1>ASSEMBLY CERTIFICATE</h1>
    <span class="certificate-rule" />
    <div class="certificate-build">BUILD / {{ summary.buildNumber }}</div>
    <dl class="certificate-specs">
      <template v-for="item in rows" :key="item.label">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </template>
    </dl>
    <p class="certificate-signature">INDIVIDUALLY CONFIGURED · ¥ {{ summary.total.toLocaleString() }}</p>
    <div>
      <button @click="$emit('copy')">SAVE LINK</button>
      <button @click="$emit('edit')">EDIT BUILD</button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ summary: { type: Object, required: true } })
defineEmits(['copy', 'edit'])

const rows = computed(() => [
  ['MOVEMENT', props.summary.movement?.name || '—'],
  ['CASE', props.summary.case?.name || '—'],
  ['DIAL', props.summary.dial?.name || '—'],
  ['HANDS', props.summary.hands?.name || '—'],
  ['STRAP', props.summary.strap?.name || '—'],
  ['BACK', props.summary.caseback?.name || '—'],
].map(([label, value]) => ({ label, value })))
</script>
