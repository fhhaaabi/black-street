<script setup>
// Slider horizontal : défilement tactile natif (scroll-snap), glisser à la souris, flèches, clavier, lecture auto facultative.
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import ProductCard from './ProductCard.vue'

const props = defineProps({ products: { type: Array, required: true }, label: { type: String, default: 'Produits' }, autoplay: Boolean })
const track = ref(null), root = ref(null)
const progress = ref(0.2), atStart = ref(true), atEnd = ref(false)

function update() {
  const t = track.value
  if (!t) return
  const max = t.scrollWidth - t.clientWidth
  atStart.value = t.scrollLeft <= 2
  atEnd.value = max <= 2 || t.scrollLeft >= max - 2
  progress.value = max > 0 ? Math.max(0.12, (t.scrollLeft + t.clientWidth * 0.4) / (max + t.clientWidth * 0.4)) : 1
  track.value.parentElement.style.setProperty('--p', progress.value.toFixed(3))
}
const step = () => (track.value.querySelector('.slide')?.offsetWidth || 260) + 16
const go = (dir) => track.value.scrollBy({ left: dir * step() * 2, behavior: 'smooth' })
function onKey(e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(1) } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) } }

// Glisser à la souris (le tactile utilise le défilement natif)
let down = false, startX = 0, startLeft = 0, moved = false
const drag = ref(false)
function pdown(e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startLeft = track.value.scrollLeft }
function pmove(e) {
  if (!down) return
  const dx = e.clientX - startX
  if (Math.abs(dx) > 6) { moved = true; drag.value = true }
  if (moved) track.value.scrollLeft = startLeft - dx
}
function pup() { down = false; drag.value = false }
const blockClick = (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false } }

// Lecture automatique : pause au survol / focus / toucher, seulement quand visible
let timer, io, paused = false
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
function start() {
  stop()
  if (!props.autoplay || reduce()) return
  timer = setInterval(() => {
    if (paused) return
    if (atEnd.value) track.value.scrollTo({ left: 0, behavior: 'smooth' })
    else go(1)
  }, 4800)
}
const stop = () => clearInterval(timer)

onMounted(async () => {
  await nextTick(); update()
  window.addEventListener('resize', update, { passive: true })
  io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
  io.observe(root.value)
})
onBeforeUnmount(() => { stop(); io?.disconnect(); window.removeEventListener('resize', update) })
watch(() => props.products, async () => { await nextTick(); track.value.scrollTo({ left: 0 }); update() })
</script>
<template>
  <div ref="root" class="slider" role="region" aria-roledescription="carrousel" :aria-label="label"
    @pointerenter="paused = true" @pointerleave="paused = false" @focusin="paused = true" @focusout="paused = false" @touchstart.passive="paused = true" @touchend.passive="paused = false">
    <div ref="track" class="track" :class="{ drag }" tabindex="0" @scroll.passive="update" @keydown="onKey"
      @pointerdown="pdown" @pointermove="pmove" @pointerup="pup" @pointerleave="pup" @click.capture="blockClick" @dragstart.prevent>
      <div v-for="p in products" :key="p.id" class="slide"><ProductCard :product="p" /></div>
    </div>
    <div class="slider-ui">
      <div class="progress" aria-hidden="true"><i></i></div>
      <button type="button" class="arrow" :disabled="atStart" aria-label="Précédent" @click="go(-1)"><i class="bi bi-arrow-left"></i></button>
      <button type="button" class="arrow" :disabled="atEnd && !autoplay" aria-label="Suivant" @click="go(1)"><i class="bi bi-arrow-right"></i></button>
    </div>
  </div>
</template>
