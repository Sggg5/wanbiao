<template>
  <svg
    class="source-derived-layer"
    viewBox="0 0 1200 1600"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <filter :id="id('metal-alpha')" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
        <feColorMatrix
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  .82 .82 .82 0 -1.02"
        />
      </filter>

      <clipPath :id="id('strap-back-clip')">
        <rect x="360" y="0" width="480" height="440" />
      </clipPath>

      <clipPath :id="id('strap-front-clip')">
        <rect x="355" y="1068" width="490" height="532" />
      </clipPath>

      <clipPath :id="id('case-clip')">
        <ellipse cx="600" cy="730" rx="370" ry="405" />
        <polygon points="330,305 870,305 920,510 280,510" />
        <polygon points="275,930 925,930 870,1165 330,1165" />
        <rect x="895" y="650" width="105" height="175" rx="22" />
      </clipPath>

      <mask :id="id('case-mask')">
        <rect width="1200" height="1600" fill="white" />
        <circle cx="600" cy="729" r="315" fill="black" />
      </mask>

      <clipPath :id="id('dial-clip')">
        <circle cx="600" cy="729" r="313" />
      </clipPath>

      <mask :id="id('dial-no-hands')">
        <rect width="1200" height="1600" fill="white" />
        <path d="M600 729 L466 622" stroke="black" stroke-width="38" stroke-linecap="round" />
        <path d="M600 729 L814 565" stroke="black" stroke-width="30" stroke-linecap="round" />
        <path d="M600 729 L425 930" stroke="black" stroke-width="12" stroke-linecap="round" />
        <path d="M600 729 L638 770" stroke="black" stroke-width="24" stroke-linecap="round" />
        <circle cx="600" cy="729" r="37" fill="black" />
      </mask>

      <mask :id="id('hands-mask')">
        <rect width="1200" height="1600" fill="black" />
        <path d="M600 729 L466 622" stroke="white" stroke-width="34" stroke-linecap="round" />
        <path d="M600 729 L814 565" stroke="white" stroke-width="26" stroke-linecap="round" />
        <path d="M600 729 L425 930" stroke="white" stroke-width="10" stroke-linecap="round" />
        <path d="M600 729 L638 770" stroke="white" stroke-width="20" stroke-linecap="round" />
        <circle cx="600" cy="729" r="34" fill="white" />
      </mask>

      <radialGradient :id="id('blue-base')" cx="42%" cy="35%" r="72%">
        <stop offset="0" stop-color="#315b7c" />
        <stop offset=".48" stop-color="#153a5d" />
        <stop offset="1" stop-color="#071a2d" />
      </radialGradient>
      <radialGradient :id="id('black-base')" cx="42%" cy="35%" r="72%">
        <stop offset="0" stop-color="#454748" />
        <stop offset=".52" stop-color="#202223" />
        <stop offset="1" stop-color="#090a0a" />
      </radialGradient>
      <radialGradient :id="id('silver-base')" cx="42%" cy="35%" r="72%">
        <stop offset="0" stop-color="#ddd9d0" />
        <stop offset=".52" stop-color="#b6b2a9" />
        <stop offset="1" stop-color="#77756f" />
      </radialGradient>

      <linearGradient :id="id('crystal-sheen')" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="white" stop-opacity=".23" />
        <stop offset=".23" stop-color="white" stop-opacity=".04" />
        <stop offset=".57" stop-color="white" stop-opacity="0" />
        <stop offset="1" stop-color="white" stop-opacity=".055" />
      </linearGradient>
    </defs>

    <template v-if="spec.kind === 'strap-back'">
      <image
        :href="sourceImage"
        x="66.6667"
        y="0"
        width="1066.6667"
        height="1600"
        preserveAspectRatio="none"
        :clip-path="url('strap-back-clip')"
        :filter="url('metal-alpha')"
      />
    </template>

    <template v-else-if="spec.kind === 'strap-front'">
      <image
        :href="sourceImage"
        x="66.6667"
        y="0"
        width="1066.6667"
        height="1600"
        preserveAspectRatio="none"
        :clip-path="url('strap-front-clip')"
        :filter="url('metal-alpha')"
      />
    </template>

    <template v-else-if="spec.kind === 'case'">
      <image
        :href="sourceImage"
        x="66.6667"
        y="0"
        width="1066.6667"
        height="1600"
        preserveAspectRatio="none"
        :clip-path="url('case-clip')"
        :mask="url('case-mask')"
        :filter="url('metal-alpha')"
      />
    </template>

    <template v-else-if="spec.kind === 'dial'">
      <circle cx="600" cy="729" r="313" :fill="dialBase" />
      <image
        :href="sourceImage"
        x="66.6667"
        y="0"
        width="1066.6667"
        height="1600"
        preserveAspectRatio="none"
        :clip-path="url('dial-clip')"
        :mask="url('dial-no-hands')"
        :style="dialImageStyle"
      />
    </template>

    <template v-else-if="spec.kind === 'hands'">
      <image
        :href="sourceImage"
        x="66.6667"
        y="0"
        width="1066.6667"
        height="1600"
        preserveAspectRatio="none"
        :mask="url('hands-mask')"
        :filter="url('metal-alpha')"
      />
    </template>

    <template v-else-if="spec.kind === 'crystal'">
      <circle cx="600" cy="729" r="309" :fill="url('crystal-sheen')" opacity=".72" />
      <ellipse cx="535" cy="646" rx="198" ry="102" fill="white" opacity=".035" transform="rotate(-28 535 646)" />
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  spec: {
    type: Object,
    required: true,
  },
})

const sourceImage = '/assets/atelier-watch-placeholder.png'
const uid = `derived-${Math.random().toString(36).slice(2, 9)}`
const id = (name) => `${uid}-${name}`
const url = (name) => `url(#${id(name)})`

const dialBase = computed(() => {
  if (props.spec.variant === 'black') return url('black-base')
  if (props.spec.variant === 'silver') return url('silver-base')
  return url('blue-base')
})

const dialImageStyle = computed(() => {
  if (props.spec.variant === 'black') {
    return { filter: 'grayscale(1) brightness(.64) contrast(1.18)' }
  }
  if (props.spec.variant === 'silver') {
    return { filter: 'grayscale(1) brightness(1.62) contrast(.78)' }
  }
  return null
})
</script>

<style scoped>
.source-derived-layer {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
