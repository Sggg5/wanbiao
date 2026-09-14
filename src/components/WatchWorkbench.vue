<template>
  <main class="workbench"><div class="wood-grain" aria-hidden="true" />
    <header class="workbench-header"><a href="#" class="brand">ATELIER <i>TIME</i></a><div><button class="build-number">BUILD / 00127</button><button class="menu" aria-label="Menu">☰</button></div></header>
    <section class="bench-content"><MovementTray /><section class="leather-mat" aria-label="Watch assembly mat"><WatchPreview /></section><PartsTray /></section><CompatibilityConfirm />
    <WorkbenchTool kind="loupe" /><WorkbenchTool kind="screwdriver" /><WorkbenchTool kind="cloth" />
    <footer class="workbench-footer"><AssemblySteps /><div class="build-price"><span>¥ {{ store.totalPrice.toLocaleString() }}</span><button>完成设计 <i>→</i></button></div></footer>
  </main>
</template>
<script setup>
import WatchPreview from './WatchPreview.vue'; import MovementTray from './MovementTray.vue'; import PartsTray from './PartsTray.vue'; import AssemblySteps from './AssemblySteps.vue'; import WorkbenchTool from './WorkbenchTool.vue'; import CompatibilityConfirm from './CompatibilityConfirm.vue'; import { useWatchBuilderStore } from '../stores/watchBuilder'
const store=useWatchBuilderStore()
</script>
