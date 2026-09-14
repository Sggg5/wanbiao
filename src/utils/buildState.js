export const serializeBuild = (build) => ({m:build.movement,c:build.case,d:build.dial,h:build.hands,s:build.strap,b:build.caseback})
const read = (value, key) => typeof value?.get === 'function' ? value.get(key) : value?.[key]
export const deserializeBuild = (value={}) => ({movement:read(value,'m'),case:read(value,'c'),dial:read(value,'d'),hands:read(value,'h'),strap:read(value,'s'),caseback:read(value,'b')})
