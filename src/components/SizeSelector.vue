<script setup>
defineProps({ sizes: { type: Array, required: true }, modelValue: String, label: { type: String, default: 'Taille' } })
const emit = defineEmits(['update:modelValue'])
</script>
<template>
  <div v-if="sizes.length">
    <span class="opt-label">{{ label }} <span v-if="modelValue" class="fw-normal text-secondary">: {{ modelValue }}</span></span>
    <div class="size-opts" role="group" :aria-label="label">
      <button v-for="s in sizes" :key="s.label" type="button" class="size-opt" :class="{ on: modelValue === s.label }"
        :disabled="!s.available" :aria-pressed="modelValue === s.label" :title="s.available ? '' : 'Indisponible'"
        @click="emit('update:modelValue', s.label)">{{ s.label }}</button>
    </div>
  </div>
</template>
