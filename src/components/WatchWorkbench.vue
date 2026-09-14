<template>
  <main class="workbench" :class="{ 'focus-mode': focusMode, 'completion-mode': completionMode }"><div class="wood-grain" aria-hidden="true" />
    <header class="workbench-header"><a href="#" class="brand">ATELIER <i>TIME</i></a><div><button class="build-number" @click="buildSheet=true">BUILD / {{ store.buildNumber }}</button><button class="menu" aria-label="Enter focus mode" @click="focusMode=true">◎</button></div></header>
    <section class="bench-content"><MovementTray :drag="activeDrag" /><section class="leather-mat" aria-label="Watch assembly mat" @click="enterFocus"><WatchPreview ref="preview" :drag="activeDrag" /></section><PartsTray :drag="activeDrag" /></section><CompatibilityConfirm />
    <WorkbenchTool kind="loupe" /><WorkbenchTool kind="screwdriver" /><WorkbenchTool kind="cloth" />
    <footer class="workbench-footer"><AssemblySteps /><div class="build-price"><span>¥ {{ store.totalPrice.toLocaleString() }}</span><button @click="completionMode=true">完成设计 <i>→</i></button></div></footer>
    <div v-if="activeDrag.isDragging" class="drag-ghost" :class="activeDrag.dragPart?.type" :style="activeDrag.ghostStyle"><span class="ghost-disc" :style="activeDrag.dragPart?.type==='dial'?{'--dial':activeDrag.dragPart.color}:{}" /><small>{{ activeDrag.dragPart?.name }}</small></div>
    <p v-if="notice" class="drag-notice">{{ notice }}</p>
    <button v-if="focusMode" class="focus-return" @click="focusMode=false">RETURN TO BENCH</button>
    <BuildSheet v-if="buildSheet" :summary="store.buildSummary" @close="buildSheet=false" @copy="copyLink" @reset="resetBuild" />
    <BuildCertificate v-if="completionMode" :summary="store.buildSummary" @copy="copyLink" @edit="completionMode=false" />
  </main>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import WatchPreview from './WatchPreview.vue'; import MovementTray from './MovementTray.vue'; import PartsTray from './PartsTray.vue'; import AssemblySteps from './AssemblySteps.vue'; import WorkbenchTool from './WorkbenchTool.vue'; import CompatibilityConfirm from './CompatibilityConfirm.vue'; import BuildSheet from './BuildSheet.vue'; import BuildCertificate from './BuildCertificate.vue'
import { useWatchBuilderStore } from '../stores/watchBuilder'; import { usePartDrag } from '../composables/usePartDrag'; import { getSharedBuild, makeShareUrl } from '../utils/shareBuild'
const store=useWatchBuilderStore(); const preview=ref(null); const focusMode=ref(false); const buildSheet=ref(false); const completionMode=ref(false); const notice=ref(''); let timer
function announce(message) { notice.value=message; clearTimeout(timer); timer=setTimeout(()=>notice.value='',1200) }
function install(part) { const action={movement:'selectMovement',case:'selectCase',dial:'selectDial',hands:'selectHands',strap:'selectStrap',caseback:'selectCaseback'}[part.type]; store[action]?.(part.id); store.goToStep(part.type); announce(`${part.name.toUpperCase()} INSTALLED`) }
const drag=usePartDrag({getInstallTarget:(point,part)=>preview.value?.installTarget(point,part),onInstall:install,onInvalid:()=>announce('NOT COMPATIBLE')}); const screenshotDrag=ref(false); const demoDrag={isDragging:true,dragPart:{id:'midnight-blue',type:'dial',name:'MIDNIGHT BLUE',color:'#102b46'},ghostStyle:{transform:'translate3d(1050px, 385px, 0)'},isOverInstallZone:true}; const activeDrag=computed(()=>screenshotDrag.value?demoDrag:drag)
function enterFocus(event) { if (!drag.isDragging && !event.target.closest('.watch-preview')) focusMode.value=true }
function resetBuild() { store.resetBuild(); buildSheet.value=false; announce('BUILD RESET') }
async function copyLink() { const url=makeShareUrl(store.build); history.replaceState(null,'',url); try { await navigator.clipboard.writeText(url); announce('LINK COPIED') } catch { announce('LINK READY') } }
function onKey(event) { if (event.key !== 'Escape') return; if (focusMode.value) focusMode.value=false; else if (buildSheet.value) buildSheet.value=false; else if (completionMode.value) completionMode.value=false }
onMounted(()=>{ store.hydrateBuild(getSharedBuild()); if (import.meta.env.DEV) { const previewMode=new URLSearchParams(location.search).get('preview'); focusMode.value=previewMode==='focus'; buildSheet.value=previewMode==='sheet'; completionMode.value=previewMode==='complete'; screenshotDrag.value=previewMode==='drag' }; window.addEventListener('keydown',onKey) }); onBeforeUnmount(()=>{window.removeEventListener('keydown',onKey);clearTimeout(timer)})
</script>
