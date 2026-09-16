import { BUILD_STATE_VERSION, deserializeBuild, serializeBuild } from './buildState'
import { defaultBuild, partCatalog } from '../data/watchParts'
import { getCompatibleParts, isCompatible } from './compatibility'

const valid = (type, id) => Boolean(id && partCatalog[type]?.some((part) => part.id === id))

function choosePart(type, requestedId, build) {
  if (valid(type, requestedId)) {
    const requested = partCatalog[type].find((part) => part.id === requestedId)
    if (isCompatible(requested, build)) return requested.id
  }

  const defaultId = defaultBuild[type]
  if (valid(type, defaultId)) {
    const fallback = partCatalog[type].find((part) => part.id === defaultId)
    if (isCompatible(fallback, build)) return fallback.id
  }

  return getCompatibleParts(type, build)[0]?.id || null
}

export function sanitizeBuild(candidate = {}) {
  const movement = valid('movement', candidate.movement) ? candidate.movement : defaultBuild.movement
  const next = { movement, case: null, dial: null, hands: null, strap: null, caseback: null }

  for (const type of ['case', 'dial', 'hands', 'strap', 'caseback']) {
    next[type] = choosePart(type, candidate[type], next)
  }

  return next
}

export function getSharedBuild(search = window.location.search) {
  const params = new URLSearchParams(search)
  const candidate = deserializeBuild(params)
  if (!candidate.version && !['m','c','d','h','s','b'].some((key) => params.has(key))) return { ...defaultBuild }
  return sanitizeBuild(candidate)
}

export function makeShareUrl(build) {
  const url = new URL(window.location.href)
  const params = serializeBuild(build)
  ;['v','m','c','d','h','s','b'].forEach((key) => url.searchParams.delete(key))
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  url.searchParams.set('v', BUILD_STATE_VERSION)
  return url.toString()
}
