<template>
  <main class="workbench" :class="{ 'focus-mode': focusMode, 'completion-mode': completionMode }">
    <div class="wood-grain" aria-hidden="true" />

    <header class="workbench-header" :inert="benchControlsLocked ? '' : undefined">
      <a href="#" class="brand">腕表 <i>工坊</i></a>
      <div>
        <button class="build-number" @click="buildSheet = true">方案 / {{ store.buildNumber }}</button>
        <button class="menu" aria-label="进入专注模式" @click="focusMode = true">◎</button>
      </div>
    </header>

    <section class="bench-content">
      <MovementTray :drag="activeDrag" :inert="benchControlsLocked ? '' : undefined" />
      <section class="leather-mat" aria-label="腕表装配垫" @click="enterFocus">
        <WatchPreview ref="preview" :drag="activeDrag" />
      </section>
      <PartsTray :drag="activeDrag" :inert="benchControlsLocked ? '' : undefined" />
    </section>

    <CompatibilityConfirm />
    <WorkbenchTool kind="loupe" />
    <WorkbenchTool kind="screwdriver" />
    <WorkbenchTool kind="cloth" />

    <footer class="workbench-footer" :inert="benchControlsLocked ? '' : undefined">
      <AssemblySteps />
      <div class="build-price">
        <span>¥ {{ store.totalPrice.toLocaleString() }}</span>
        <button @click="finishBuild">完成设计 <i>→</i></button>
      </div>
    </footer>

    <div
      v-if="activeDrag.isDragging"
      class="drag-ghost"
      :class="activeDrag.dragPart?.type"
      :style="activeDrag.ghostStyle"
      aria-hidden="true"
    >
      <span
        class="ghost-disc"
        :style="activeDrag.dragPart?.type === 'dial' ? { '--dial': activeDrag.dragPart.color } : {}"
      />
      <small>{{ activeDrag.dragPart?.name }}</small>
    </div>

    <p v-if="notice" class="drag-notice" aria-live="polite">{{ notice }}</p>
    <button v-if="focusMode" class="focus-return" @click="focusMode = false">返回工作台</button>

    <BuildSheet
      v-if="buildSheet"
      :summary="store.buildSummary"
      @close="buildSheet = false"
      @copy="copyLink"
      @reset="resetBuild"
    />
    <BuildCertificate
      v-if="completionMode"
      :summary="store.buildSummary"
      @copy="copyLink"
      @edit="completionMode = false"
    />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import WatchPreview from './WatchPreview.vue'
import MovementTray from './MovementTray.vue'
import PartsTray from './PartsTray.vue'
import AssemblySteps from './AssemblySteps.vue'
import WorkbenchTool from './WorkbenchTool.vue'
import CompatibilityConfirm from './CompatibilityConfirm.vue'
import BuildSheet from './BuildSheet.vue'
import BuildCertificate from './BuildCertificate.vue'
import { useWatchBuilderStore } from '../stores/watchBuilder'
import { usePartDrag } from '../composables/usePartDrag'
import { getSharedBuild, makeShareUrl } from '../utils/shareBuild'

const store = useWatchBuilderStore()
const preview = ref(null)
const focusMode = ref(false)
const buildSheet = ref(false)
const completionMode = ref(false)
const notice = ref('')
const benchControlsLocked = computed(() => (
  focusMode.value
  || completionMode.value
  || buildSheet.value
  || Boolean(store.pendingMovement)
))
let timer

function announce(message) {
  notice.value = message
  clearTimeout(timer)
  timer = setTimeout(() => { notice.value = '' }, 1200)
}

function install(part) {
  const result = store.setSelection(part.type, part.id)
  if (result.status === 'installed') {
    store.goToStep(part.type)
    announce(`已安装 ${part.name}`)
  } else if (result.status === 'incompatible') {
    announce('零件不兼容')
  }
}

function invalidDrop(_part, reason) {
  announce(reason === 'incompatible' ? '零件不兼容' : '请拖到腕表安装区域')
}

const drag = usePartDrag({
  getInstallTarget: (point, part) => preview.value?.installTarget(point, part),
  onInstall: install,
  onInvalid: invalidDrop,
})

const screenshotDrag = ref(false)
const demoDrag = {
  isDragging: true,
  dragPart: { id: 'midnight-blue', type: 'dial', name: '午夜蓝', color: '#102b46' },
  ghostStyle: { transform: 'translate3d(1050px, 385px, 0)' },
  isOverInstallZone: true,
  consumeClick: () => false,
}
const activeDrag = computed(() => screenshotDrag.value ? demoDrag : drag)

function enterFocus(event) {
  if (completionMode.value || buildSheet.value || store.pendingMovement || drag.isDragging) return
  if (!event.target.closest('.watch-preview')) focusMode.value = true
}

function finishBuild() {
  focusMode.value = false
  buildSheet.value = false
  completionMode.value = true
}

function resetBuild() {
  store.resetBuild()
  buildSheet.value = false
  announce('方案已重置')
}

async function copyLink() {
  const url = makeShareUrl(store.build)
  history.replaceState(null, '', url)
  try {
    await navigator.clipboard.writeText(url)
    announce('链接已复制')
  } catch {
    announce('分享链接已生成')
  }
}

function onKey(event) {
  if (event.key !== 'Escape') return
  if (store.pendingMovement) store.cancelMovement()
  else if (buildSheet.value) buildSheet.value = false
  else if (completionMode.value) completionMode.value = false
  else if (focusMode.value) focusMode.value = false
}

onMounted(() => {
  store.hydrateBuild(getSharedBuild())
  if (import.meta.env.DEV) {
    const previewMode = new URLSearchParams(location.search).get('preview')
    focusMode.value = previewMode === 'focus'
    buildSheet.value = previewMode === 'sheet'
    completionMode.value = previewMode === 'complete'
    screenshotDrag.value = previewMode === 'drag'
  }
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimeout(timer)
})
</script>
