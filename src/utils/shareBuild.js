import { deserializeBuild, serializeBuild } from './buildState'
import { defaultBuild, partCatalog } from '../data/watchParts'
import { getInvalidSelections } from './compatibility'

const valid = (type, id) => partCatalog[type].some((part) => part.id === id)
export function sanitizeBuild(candidate = {}) {
  const next = { ...defaultBuild }
  Object.entries(next).forEach(([type]) => { if (valid(type, candidate[type])) next[type] = candidate[type] })
  return getInvalidSelections(next).length ? { ...defaultBuild } : next
}
export function getSharedBuild(search = window.location.search) { return sanitizeBuild(deserializeBuild(new URLSearchParams(search))) }
export function makeShareUrl(build) {
  const url = new URL(window.location.href); const params = serializeBuild(build)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return url.toString()
}
