<script setup>
defineProps({ icon: { type: String, default: 'bi-bag' }, title: { type: String, required: true }, text: { type: String, default: '' } })
</script>
<template>
  <div class="empty" role="status">
    <i class="bi" :class="icon" aria-hidden="true"></i>
    <h2 class="h3 mt-2">{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <div class="d-flex gap-2 justify-content-center flex-wrap"><slot /></div>
  </div>
</template>
