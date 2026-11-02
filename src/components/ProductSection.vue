<script setup>
import ProductGrid from './ProductGrid.vue'
defineProps({ title: String, subtitle: String, products: Array, to: { type: [String, Object], default: null }, dark: Boolean })
</script>
<template>
  <section v-if="products.length" class="section" :aria-label="title">
    <div class="container">
      <div class="section-head">
        <div><h2>{{ title }}</h2><p v-if="subtitle">{{ subtitle }}</p></div>
        <RouterLink v-if="to" :to="to" class="link-more">Tout voir</RouterLink>
      </div>
      <ProductGrid :products="products" />
    </div>
  </section>
</template>
