<script setup>
// Curseur personnalisé : uniquement souris (pas tactile) et sans "réduire les animations".
import { ref, onMounted, onBeforeUnmount } from 'vue'
const ring = ref(null), enabled = ref(false), hot = ref(false), hidden = ref(true)
let x = 0, y = 0, cx = 0, cy = 0, raf = 0
const HOT = 'a, button, input, select, label, summary, [role="button"], .slide'
function tick() {
  cx += (x - cx) * 0.22; cy += (y - cy) * 0.22
  if (ring.value) ring.value.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
  raf = requestAnimationFrame(tick)
}
const move = (e) => { x = e.clientX; y = e.clientY; hidden.value = false; hot.value = !!e.target.closest?.(HOT) }
const leave = () => { hidden.value = true }
onMounted(() => {
  const ok = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!ok) return
  enabled.value = true
  window.addEventListener('pointermove', move, { passive: true })
  document.documentElement.addEventListener('mouseleave', leave)
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', move)
  document.documentElement.removeEventListener('mouseleave', leave)
  cancelAnimationFrame(raf)
})
</script>
<template>
  <div v-if="enabled" ref="ring" class="cursor-ring" :class="{ hot }" :style="{ opacity: hidden ? 0 : 1 }" aria-hidden="true"></div>
</template>
