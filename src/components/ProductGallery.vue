<script setup>
import { ref, watch, computed } from 'vue'
import { onImgError } from '../utils/image.js'
const props = defineProps({ images: { type: Array, required: true }, name: { type: String, required: true } })
const index = ref(0)
watch(() => props.images, () => { index.value = 0 }) // nouvelle couleur → on repart de la 1re photo
const current = computed(() => props.images[index.value] || props.images[0])
const go = (d) => { index.value = (index.value + d + props.images.length) % props.images.length }
let startX = null
const onStart = (e) => { startX = e.touches[0].clientX }
const onEnd = (e) => {
  if (startX === null) return
  const dx = e.changedTouches[0].clientX - startX
  if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
  startX = null
}
</script>
<template>
  <div>
    <div class="gallery-main" @touchstart.passive="onStart" @touchend.passive="onEnd">
      <Transition name="swap" mode="out-in">
        <img :key="current" :src="current" :alt="`${name}, vue ${index + 1} sur ${images.length}`" width="800" height="800" @error="onImgError" />
      </Transition>
      <template v-if="images.length > 1">
        <button class="gallery-nav" style="left: 10px" type="button" aria-label="Photo précédente" @click="go(-1)"><i class="bi bi-chevron-left"></i></button>
        <button class="gallery-nav" style="right: 10px" type="button" aria-label="Photo suivante" @click="go(1)"><i class="bi bi-chevron-right"></i></button>
      </template>
    </div>
    <div v-if="images.length > 1" class="thumbs">
      <button v-for="(src, i) in images" :key="src" type="button" class="thumb" :class="{ on: i === index }" :aria-label="`Afficher la photo ${i + 1}`" :aria-current="i === index" @click="index = i">
        <img :src="src" alt="" loading="lazy" @error="onImgError" />
      </button>
    </div>
  </div>
</template>
