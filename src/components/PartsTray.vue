<template>
  <aside v-if="store.activeStep !== 'movement'" class="parts-tray" :class="`parts-${store.activeStep}`" aria-label="零件选择">
    <Transition name="parts-change" mode="out-in">
      <div :key="store.activeStep" class="parts-stack">
        <button
          v-for="part in parts"
          :key="part.id"
          class="dial-part"
          :class="{ selected: selectedId === part.id, disabled: !compatible(part), dragging: drag?.dragPart?.id === part.id }"
          :disabled="!compatible(part)"
          :aria-disabled="!compatible(part)"
          :aria-pressed="selectedId === part.id"
          :aria-label="partLabel(part)"
          @pointerdown="drag?.begin($event, part)"
          @click="select(part)"
        >
          <span
            class="dial-disc"
            :class="part.type"
            :style="part.type === 'dial' ? { '--dial': part.color, '--glow': part.glow } : {}"
          >
            <i
              v-for="n in part.type === 'dial' ? 12 : 3"
              :key="n"
              :style="part.type === 'dial' ? { transform: `rotate(${n * 30}deg)` } : {}"
            />
          </span>
          <span class="part-meta">
            <b>{{ part.name }}</b>
            <small>{{ part.sku || part.frequency || part.model }} · {{ part.price ? `+ ¥${part.price}` : '标配' }}</small>
            <em v-if="!compatible(part)">{{ incompatibilityLabel(part) }}</em>
          </span>
        </button>
      </div>
    </Transition>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useWatchBuilderStore } from '../stores/watchBuilder'
import { partCatalog } from '../data/watchParts'
import { checkCompatibility } from '../utils/compatibility'

const props = defineProps({ drag: Object })
const store = useWatchBuilderStore()
const parts = computed(() => partCatalog[store.activeStep] || [])
const selectedId = computed(() => store.build[store.activeStep])
const compatibility = (part) => checkCompatibility(part, store.build)
const compatible = (part) => compatibility(part).compatible

function incompatibilityLabel(part) {
  const reason = compatibility(part).reasons[0]
  const labels = {
    MOVEMENT_MISMATCH: '机芯不兼容',
    DIAL_DIAMETER_MISMATCH: '表盘尺寸不兼容',
    HAND_SIZE_MISMATCH: '指针尺寸不兼容',
    LUG_WIDTH_MISMATCH: '表耳宽度不兼容',
    CASEBACK_CASE_MISMATCH: '表壳不兼容',
  }
  return labels[reason] || '不兼容'
}

function partLabel(part) {
  const state = compatible(part) ? (selectedId.value === part.id ? '已选择' : '可选择') : incompatibilityLabel(part)
  return `${part.name}，${state}`
}

function select(part) {
  if (props.drag?.consumeClick?.() || !compatible(part)) return
  store.setSelection(part.type, part.id)
}
</script>
