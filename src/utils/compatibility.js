import { partCatalog } from '../data/watchParts.js'
export function isCompatible(part, build) { return !part?.compatibleMovements || part.compatibleMovements.includes(build.movement) }
export function getCompatibleParts(type, build) { return (partCatalog[type] || []).filter((part) => isCompatible(part, build)) }
export function getInvalidSelections(build) { return ['case','dial','hands','strap','caseback'].filter((type) => { const part=(partCatalog[type]||[]).find((item)=>item.id===build[type]); return part && !isCompatible(part,build) }) }
