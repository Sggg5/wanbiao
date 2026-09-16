export const BUILD_STATE_VERSION = '1'

export const serializeBuild = (build) => ({
  v: BUILD_STATE_VERSION,
  m: build.movement,
  c: build.case,
  d: build.dial,
  h: build.hands,
  s: build.strap,
  b: build.caseback,
})

const read = (value, key) => typeof value?.get === 'function' ? value.get(key) : value?.[key]

export const deserializeBuild = (value = {}) => ({
  version: read(value, 'v'),
  movement: read(value, 'm'),
  case: read(value, 'c'),
  dial: read(value, 'd'),
  hands: read(value, 'h'),
  strap: read(value, 's'),
  caseback: read(value, 'b'),
})
