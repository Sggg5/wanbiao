<template><div class="watch-stage" @pointermove="tilt" @pointerleave="resetTilt"><div class="watch-shadow" :style="{transform:`translate(${pointer.x*7}px,${pointer.y*9}px)`}" /><div class="watch-preview" :style="watchStyle"><img class="watch-image fallback-watch" src="/assets/atelier-watch-placeholder.png" alt="Custom steel watch preview" /><WatchLayer layer="strap-back" :src="strap.backLayer" :key-value="strap.id" /><WatchLayer layer="case" :src="watchCase.previewLayer" :key-value="watchCase.id" /><WatchLayer layer="dial" :src="dial.previewLayer" :color="dial.color" :key-value="dial.id" /><WatchLayer layer="hands" :src="watchHands.previewLayer" :key-value="watchHands.id" /><WatchLayer layer="crystal" src="/assets/atelier-watch-placeholder.png" key-value="crystal" /><WatchLayer layer="strap-front" :src="strap.frontLayer" :key-value="strap.id" /><div class="crystal-highlight" :style="{transform:`translate(${pointer.x*16}px,${pointer.y*14}px)`}" /></div></div></template>
<script setup>
import { computed, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useWatchBuilderStore } from '../stores/watchBuilder'
import { partCatalog } from '../data/watchParts'
import WatchLayer from './watch/WatchLayer.vue'
const store=useWatchBuilderStore(); const { build }=storeToRefs(store)
const part=(type)=>computed(()=>partCatalog[type].find((item)=>item.id===build.value[type]))
const dial=part('dial'),watchCase=part('case'),watchHands=part('hands'),strap=part('strap')
const pointer = reactive({ x: 0, y: 0 })
const watchStyle = computed(() => ({ transform: `rotateX(${-pointer.y * 3}deg) rotateY(${pointer.x * 5}deg)` }))
function tilt(event) { const rect = event.currentTarget.getBoundingClientRect(); pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1; pointer.y = (event.clientY - rect.top) / rect.height * 2 - 1 }
function resetTilt() { pointer.x = 0; pointer.y = 0 }
</script>
