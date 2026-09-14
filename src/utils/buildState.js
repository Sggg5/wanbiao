export const serializeBuild = (build) => ({m:build.movement,c:build.case,d:build.dial,h:build.hands,s:build.strap,b:build.caseback})
export const deserializeBuild = (value={}) => ({movement:value.m,case:value.c,dial:value.d,hands:value.h,strap:value.s,caseback:value.b})
