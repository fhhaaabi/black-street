<script setup>
// Bandeau d'en-tête de page : même identité, ambiance de couleurs propre à chaque page (a1/a2).
defineProps({ title: { type: String, required: true }, text: String, a1: String, a2: String, compact: Boolean })
</script>
<template>
  <header class="page-hero" :class="{ compact }" :style="{ '--a1': a1 || undefined, '--a2': a2 || undefined }">
    <div class="container">
      <slot name="top" />
      <h1 class="grad-text">{{ title }}</h1>
      <p v-if="text">{{ text }}</p>
      <slot />
    </div>
  </header>
</template>
