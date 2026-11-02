<script setup>
import ProductCard from './ProductCard.vue'
defineProps({ products: { type: Array, required: true } })
</script>
<template>
  <div class="row g-3 g-lg-4 row-cols-2 row-cols-md-3 row-cols-xl-4">
    <div v-for="(p, i) in products" :key="p.id" v-reveal="{ delay: (i % 4) * 60 }" class="col">
      <ProductCard :product="p"><template v-if="$slots.actions" #actions><slot name="actions" :product="p" /></template></ProductCard>
    </div>
  </div>
</template>
