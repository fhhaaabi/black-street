<script setup>
import { computed } from 'vue'
const props = defineProps({ modelValue: { type: Number, required: true }, max: { type: Number, default: 99 }, min: { type: Number, default: 1 } })
const emit = defineEmits(['update:modelValue'])
const clamp = (n) => Math.max(props.min, Math.min(Number.isFinite(n) ? Math.floor(n) : props.min, Math.max(props.max, props.min)))
const set = (n) => emit('update:modelValue', clamp(n))
const atMin = computed(() => props.modelValue <= props.min)
const atMax = computed(() => props.modelValue >= props.max)
</script>
<template>
  <div class="qty" role="group" aria-label="Quantité">
    <button type="button" :disabled="atMin" aria-label="Diminuer la quantité" @click="set(modelValue - 1)"><i class="bi bi-dash-lg"></i></button>
    <input type="number" inputmode="numeric" :value="modelValue" :min="min" :max="max" aria-label="Quantité" @change="set(Number($event.target.value)); $event.target.value = clamp(Number($event.target.value))" />
    <button type="button" :disabled="atMax" aria-label="Augmenter la quantité" @click="set(modelValue + 1)"><i class="bi bi-plus-lg"></i></button>
  </div>
</template>
