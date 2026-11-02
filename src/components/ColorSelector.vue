<script setup>
import { onImgError } from '../utils/image.js'
import { isColorAvailable } from '../utils/product.js'
defineProps({ product: { type: Object, required: true }, modelValue: String })
const emit = defineEmits(['update:modelValue'])
</script>
<template>
  <div>
    <span class="opt-label">Couleur
      <span class="fw-normal text-secondary">: {{ product.colors.find((c) => c.id === modelValue)?.name }}</span>
    </span>
    <div class="color-opts" role="group" aria-label="Couleur">
      <button v-for="c in product.colors" :key="c.id" type="button" class="color-opt"
        :class="{ on: modelValue === c.id, off: !isColorAvailable(product, c) }" :aria-pressed="modelValue === c.id"
        :aria-label="c.name + (isColorAvailable(product, c) ? '' : ' (indisponible)')" :title="c.name"
        @click="emit('update:modelValue', c.id)">
        <img :src="c.images[0]" alt="" loading="lazy" @error="onImgError" />
        <span class="dot" :style="{ background: c.hex }"></span>
      </button>
    </div>
  </div>
</template>
