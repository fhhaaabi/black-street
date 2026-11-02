<script setup>
import { computed } from 'vue'
import { getProductById } from '../data/products.js'
import { formatPrice } from '../utils/currency.js'
import { onImgError } from '../utils/image.js'
import { variantStock } from '../utils/product.js'
import QuantitySelector from './QuantitySelector.vue'

const props = defineProps({ item: { type: Object, required: true }, alert: { type: Object, default: null } })
const emit = defineEmits(['quantity', 'remove'])
const max = computed(() => {
  const p = getProductById(props.item.productId)
  return (p && variantStock(p, props.item.colorId, props.item.size)) ?? 99
})
</script>
<template>
  <article class="cart-line">
    <RouterLink v-if="item.slug" :to="`/produit/${item.slug}`"><img :src="item.image" :alt="item.name" width="88" height="88" @error="onImgError" /></RouterLink>
    <img v-else :src="item.image" :alt="item.name" width="88" height="88" @error="onImgError" />
    <div>
      <div class="d-flex justify-content-between gap-2">
        <h3 class="h6 mb-1">{{ item.name }}</h3>
        <button type="button" class="btn-icon" style="width: 40px; height: 40px; margin: -8px -8px 0 0" :aria-label="`Supprimer ${item.name}`" @click="emit('remove')"><i class="bi bi-trash3"></i></button>
      </div>
      <p class="meta mb-2">
        <span v-if="item.colorName">Couleur : {{ item.colorName }}</span>
        <span v-if="item.size"> · {{ item.sizeLabel || 'Taille' }} : {{ item.size }}</span><br />
        Prix unitaire : {{ formatPrice(item.price) }}
      </p>
      <p v-if="alert" class="alert-soft py-2 small mb-2" role="alert"><i class="bi bi-exclamation-triangle"></i>
        {{ alert.message }}<span v-if="alert.type === 'price'"> Nouveau prix : {{ formatPrice(alert.newPrice) }}.</span>
      </p>
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <QuantitySelector :model-value="item.quantity" :max="max" @update:model-value="emit('quantity', $event)" />
        <strong class="price">{{ formatPrice(item.price * item.quantity) }}</strong>
      </div>
    </div>
  </article>
</template>
