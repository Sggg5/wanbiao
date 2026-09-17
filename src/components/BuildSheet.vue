<template>
  <aside class="build-sheet" role="dialog" aria-modal="true" aria-label="配置清单">
    <button class="sheet-close" @click="$emit('close')" aria-label="关闭配置清单">×</button>
    <p>腕表工坊 / 配置清单</p>
    <h2>方案 / {{ summary.buildNumber }}</h2>
    <dl>
      <template v-for="item in rows" :key="item.label">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </template>
    </dl>
    <div class="sheet-total">¥ {{ summary.total.toLocaleString() }}</div>
    <div class="sheet-actions">
      <button @click="$emit('copy')">复制链接</button>
      <template v-if="!confirming">
        <button @click="confirming = true">重置</button>
      </template>
      <template v-else>
        <button @click="confirming = false">取消</button>
        <button class="confirm-reset" @click="confirmReset">确认重置</button>
      </template>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ summary: { type: Object, required: true } })
const emit = defineEmits(['close', 'copy', 'reset'])
const confirming = ref(false)

const rows = computed(() => [
  ['机芯', props.summary.movement],
  ['表壳', props.summary.case],
  ['表盘', props.summary.dial],
  ['指针', props.summary.hands],
  ['表带', props.summary.strap],
  ['底盖', props.summary.caseback],
].map(([label, item]) => ({ label, value: item?.name || '—' })))

function confirmReset() {
  confirming.value = false
  emit('reset')
}
</script>
