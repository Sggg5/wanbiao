import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { defaultBuild, partCatalog } from '../data/watchParts'
import { getInvalidSelections } from '../utils/compatibility'
import { serializeBuild } from '../utils/buildState'

const lookup = (type, id) => partCatalog[type].find((part) => part.id === id)
export const useWatchBuilderStore = defineStore('watchBuilder', () => {
  const selectedMovement = ref(defaultBuild.movement); const selectedCase = ref(defaultBuild.case); const selectedDial = ref(defaultBuild.dial)
  const selectedHands = ref(defaultBuild.hands); const selectedStrap = ref(defaultBuild.strap); const selectedCaseback = ref(defaultBuild.caseback)
  const activeStep = ref('dial'); const buildNumber = ref('00127'); const pendingMovement = ref(null)
  const build = computed(() => ({movement:selectedMovement.value,case:selectedCase.value,dial:selectedDial.value,hands:selectedHands.value,strap:selectedStrap.value,caseback:selectedCaseback.value}))
  const currentCompatibility = computed(() => getInvalidSelections(build.value))
  const totalPrice = computed(() => ['movement','case','dial','hands','strap','caseback'].reduce((sum,type) => sum + (lookup(type,build.value[type])?.price || 0),0))
  const buildSummary = computed(() => ({ movement:lookup('movement',selectedMovement.value),case:lookup('case',selectedCase.value),dial:lookup('dial',selectedDial.value),hands:lookup('hands',selectedHands.value),strap:lookup('strap',selectedStrap.value),caseback:lookup('caseback',selectedCaseback.value),total:totalPrice.value,buildNumber:buildNumber.value }))
  function selectMovement(id) { const next={...build.value,movement:id}; const invalid=getInvalidSelections(next); if (invalid.length) { pendingMovement.value={id,invalid}; return false } selectedMovement.value=id; return true }
  function confirmMovement() { if (!pendingMovement.value) return; selectedMovement.value=pendingMovement.value.id; pendingMovement.value.invalid.forEach((type)=>{ const compatible=partCatalog[type].find((part)=>part.compatibleMovements.includes(selectedMovement.value)); if (type==='case') selectedCase.value=compatible?.id || null; if (type==='dial') selectedDial.value=compatible?.id || null; if (type==='hands') selectedHands.value=compatible?.id || null; if (type==='strap') selectedStrap.value=compatible?.id || null; if (type==='caseback') selectedCaseback.value=compatible?.id || null }); pendingMovement.value=null }
  const cancelMovement = () => { pendingMovement.value=null }; const selectCase=(id)=>selectedCase.value=id; const selectDial=(id)=>selectedDial.value=id; const selectHands=(id)=>selectedHands.value=id; const selectStrap=(id)=>selectedStrap.value=id; const selectCaseback=(id)=>selectedCaseback.value=id
  const goToStep=(step)=>activeStep.value=step; function resetBuild(){ selectedMovement.value=defaultBuild.movement; selectedCase.value=defaultBuild.case; selectedDial.value=defaultBuild.dial; selectedHands.value=defaultBuild.hands; selectedStrap.value=defaultBuild.strap; selectedCaseback.value=defaultBuild.caseback; activeStep.value='dial' }
  function hydrateBuild(next) { selectedMovement.value=next.movement; selectedCase.value=next.case; selectedDial.value=next.dial; selectedHands.value=next.hands; selectedStrap.value=next.strap; selectedCaseback.value=next.caseback; pendingMovement.value=null }
  return {selectedMovement,selectedCase,selectedDial,selectedHands,selectedStrap,selectedCaseback,activeStep,buildNumber,pendingMovement,totalPrice,currentCompatibility,buildSummary,build,selectMovement,confirmMovement,cancelMovement,selectCase,selectDial,selectHands,selectStrap,selectCaseback,goToStep,resetBuild,hydrateBuild,serializeBuild:()=>serializeBuild(build.value)}
})
