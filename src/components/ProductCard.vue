<script setup>
import { computed, ref } from 'vue'
import { categoryName } from '../data/categories.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { formatPrice } from '../utils/currency.js'
import { onImgError } from '../utils/image.js'
import { discountPercent, isColorAvailable, isNew, isOnSale, isProductAvailable } from '../utils/product.js'

const props = defineProps({ product: { type: Object, required: true } })
const fav = useFavoritesStore()
const el = ref(null), loaded = ref(false), altReady = ref(false)
const cover = computed(() => (props.product.colors.find((c) => isColorAvailable(props.product, c)) || props.product.colors[0]))
const url = computed(() => `/produit/${props.product.slug}`)
const altSrc = computed(() => cover.value.images[1])

// Effets de survol : souris uniquement et sans "réduire les animations"
const fine = typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches
const loadAlt = ref(false) // la 2e image n'est chargée qu'au premier survol (économie de données)
function onEnter() { if (fine) loadAlt.value = true }
function onMove(e) {
  if (!fine || !el.value) return
  const r = el.value.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
  const s = el.value.style
  s.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`)
  s.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`)
  s.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
  s.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
}
function onLeave() { if (el.value) { el.value.style.setProperty('--rx', '0deg'); el.value.style.setProperty('--ry', '0deg') } }
</script>
<template>
  <article ref="el" class="product-card" @pointerenter="onEnter" @pointermove="onMove" @pointerleave="onLeave">
    <span class="glare" aria-hidden="true"></span>
    <div class="img-box" :class="{ loaded }">
      <RouterLink :to="url" :aria-label="`Voir ${product.name}`" tabindex="-1">
        <img class="main" :src="cover.images[0]" :alt="product.name" loading="lazy" width="800" height="800" draggable="false" @load="loaded = true" @error="(e) => { onImgError(e); loaded = true }" />
        <img v-if="loadAlt" class="alt" :class="{ ready: altReady }" :src="altSrc" alt="" width="800" height="800" draggable="false" @load="altReady = true" />
      </RouterLink>
      <div class="badges">
        <span v-if="isNew(product)" class="badge-tag new">Nouveau</span>
        <span v-if="isOnSale(product)" class="badge-tag sale">Promotion -{{ discountPercent(product) }}%</span>
        <span v-if="!isProductAvailable(product)" class="badge-tag out">Indisponible</span>
      </div>
      <button type="button" class="fav-btn" :class="{ active: fav.has(product.id) }" :aria-pressed="fav.has(product.id)"
        :aria-label="fav.has(product.id) ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`" @click="fav.toggle(product)">
        <i class="bi" :class="fav.has(product.id) ? 'bi-heart-fill' : 'bi-heart'"></i>
      </button>
    </div>
    <div class="card-body">
      <p class="cat">{{ categoryName(product.category) }}</p>
      <h3><RouterLink :to="url">{{ product.name }}</RouterLink></h3>
      <div><span class="price">{{ formatPrice(product.price) }}</span><span v-if="isOnSale(product)" class="price-old">{{ formatPrice(product.oldPrice) }}</span></div>
      <div v-if="product.colors.length > 1" class="dots" :aria-label="`${product.colors.length} couleurs`">
        <span v-for="c in product.colors" :key="c.id" class="dot" :style="{ background: c.hex }" :title="c.name"></span>
      </div>
      <div v-else class="mb-3"></div>
      <RouterLink :to="url" class="btn btn-line w-100">Consulter</RouterLink>
      <slot name="actions" />
    </div>
  </article>
</template>
