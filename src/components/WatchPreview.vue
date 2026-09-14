<template><div ref="stage" class="watch-stage" @pointermove="tilt" @pointerleave="resetTilt"><div class="watch-shadow" :style="{transform:`translate(${pointer.x*7}px,${pointer.y*9}px)`}" /><div class="install-ring" v-if="drag?.isDragging && compatibleDrag" :class="{ visible: drag.isOverInstallZone }" :style="zoneStyle"><span v-if="drag.isOverInstallZone">PLACE TO INSTALL</span></div><div class="watch-preview" :style="watchStyle"><img class="watch-image fallback-watch" src="/assets/atelier-watch-placeholder.png" alt="Custom steel watch preview" /><WatchLayer layer="strap-back" :src="strap.backLayer" :key-value="strap.id" /><WatchLayer layer="case" :src="watchCase.previewLayer" :key-value="watchCase.id" /><WatchLayer layer="dial" :src="dial.previewLayer" :color="dial.color" :key-value="dial.id" /><WatchLayer layer="hands" :src="watchHands.previewLayer" :key-value="watchHands.id" /><WatchLayer layer="crystal" src="/assets/atelier-watch-placeholder.png" key-value="crystal" /><WatchLayer layer="strap-front" :src="strap.frontLayer" :key-value="strap.id" /><div class="crystal-highlight" :style="{transform:`translate(${pointer.x*16}px,${pointer.y*14}px)`}" /></div></div></template>
<script setup>
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWatchBuilderStore } from '../stores/watchBuilder'
import { partCatalog } from '../data/watchParts'
import WatchLayer from './watch/WatchLayer.vue'
import { installZones } from '../config/installZones'
import { isCompatible } from '../utils/compatibility'
const props=defineProps({drag:Object}); const stage=ref(null)
const store=useWatchBuilderStore(); const { build }=storeToRefs(store)
const part=(type)=>computed(()=>partCatalog[type].find((item)=>item.id===build.value[type]))
const dial=part('dial'),watchCase=part('case'),watchHands=part('hands'),strap=part('strap')
const pointer = reactive({ x: 0, y: 0 })
const watchStyle = computed(() => ({ transform: `rotateX(${-pointer.y * 3}deg) rotateY(${pointer.x * 5}deg)` }))
function tilt(event) { const rect = event.currentTarget.getBoundingClientRect(); pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1; pointer.y = (event.clientY - rect.top) / rect.height * 2 - 1 }
function resetTilt() { pointer.x = 0; pointer.y = 0 }
const compatibleDrag=computed(()=>props.drag?.dragPart && isCompatible(props.drag.dragPart,build.value))
const zoneStyle=computed(()=>{ const zone=installZones[props.drag?.dragPart?.type] || installZones.case; return {left:`${zone.x*100}%`,top:`${zone.y*100}%`,width:`${zone.radius*200}%`,aspectRatio:'1'} })
function installTarget(point, part) { if (!stage.value || !part || !isCompatible(part,build.value)) return false; const rect=stage.value.getBoundingClientRect(); const x=(point.x-rect.left)/rect.width; const y=(point.y-rect.top)/rect.height; const zone=installZones[part.type]; if (!zone) return false; const inZone=(target)=>Math.hypot(x-target.x,y-target.y)<=target.radius; return inZone(zone) || (zone.secondary && inZone(zone.secondary)) }
defineExpose({installTarget})
</script>
