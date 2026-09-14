<template><aside class="build-sheet" role="dialog" aria-label="Build sheet"><button class="sheet-close" @click="$emit('close')" aria-label="Close build sheet">×</button><p>ATELIER TIME / BUILD SHEET</p><h2>BUILD / {{ summary.buildNumber }}</h2><dl><template v-for="item in rows" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></template></dl><div class="sheet-total">¥ {{ summary.total.toLocaleString() }}</div><div class="sheet-actions"><button @click="$emit('copy')">COPY LINK</button><button v-if="!confirming" @click="confirming=true">RESET</button><button v-else class="confirm-reset" @click="confirming=false; $emit('reset')">RESET BUILD?</button></div></aside></template>
<script setup>
import { computed, ref } from 'vue'
const props=defineProps({ summary:{type:Object,required:true} }); defineEmits(['close','copy','reset']); const confirming=ref(false)
const rows=computed(()=>[['MOVEMENT',props.summary.movement],['CASE',props.summary.case],['DIAL',props.summary.dial],['HANDS',props.summary.hands],['STRAP',props.summary.strap],['BACK',props.summary.caseback]].map(([label,item])=>({label,value:item?.name || '—'})))
</script>
