<template>
  <section class="build-certificate" aria-label="腕表装配证书">
    <p>腕表工坊</p>
    <h1>装配证书</h1>
    <span class="certificate-rule" />
    <div class="certificate-build">方案 / {{ summary.buildNumber }}</div>
    <dl class="certificate-specs">
      <template v-for="item in rows" :key="item.label">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </template>
    </dl>
    <p class="certificate-signature">专属定制 · ¥ {{ summary.total.toLocaleString() }}</p>
    <div>
      <button @click="$emit('copy')">保存链接</button>
      <button @click="$emit('edit')">继续编辑</button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ summary: { type: Object, required: true } })
defineEmits(['copy', 'edit'])

const rows = computed(() => [
  ['机芯', props.summary.movement?.name || '—'],
  ['表壳', props.summary.case?.name || '—'],
  ['表盘', props.summary.dial?.name || '—'],
  ['指针', props.summary.hands?.name || '—'],
  ['表带', props.summary.strap?.name || '—'],
  ['底盖', props.summary.caseback?.name || '—'],
].map(([label, value]) => ({ label, value })))
</script>
