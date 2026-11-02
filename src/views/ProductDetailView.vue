<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { shop } from '../config/shop.js'
import { products, getProductBySlug } from '../data/products.js'
import { categoryName } from '../data/categories.js'
import { useCartStore } from '../stores/cart.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { useUiStore } from '../stores/ui.js'
import { formatPrice } from '../utils/currency.js'
import { getColor, isColorAvailable, isNew, isSizeAvailable, priceInfo, sizeLabel, variantStock } from '../utils/product.js'
import { validateSelection } from '../utils/validation.js'
import ProductGallery from '../components/ProductGallery.vue'
import ColorSelector from '../components/ColorSelector.vue'
import SizeSelector from '../components/SizeSelector.vue'
import QuantitySelector from '../components/QuantitySelector.vue'
import ProductGrid from '../components/ProductGrid.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const cart = useCartStore(), fav = useFavoritesStore(), ui = useUiStore()

const product = computed(() => getProductBySlug(route.params.slug))
const colorId = ref(null), size = ref(null), quantity = ref(1), errors = ref([]), justAdded = ref(false)

function reset() {
  const p = product.value
  if (!p) return
  colorId.value = (p.colors.find((c) => isColorAvailable(p, c)) || p.colors[0]).id
  size.value = null; quantity.value = 1; errors.value = []
}
watch(product, reset, { immediate: true })

const color = computed(() => (product.value ? getColor(product.value, colorId.value) : null))
const sLabel = computed(() => (product.value ? sizeLabel(product.value) : null))
const sizes = computed(() => (color.value ? color.value.sizes.map((s) => ({ label: s.label, available: isSizeAvailable(s) && color.value.available !== false })) : []))
const price = computed(() => priceInfo(product.value, colorId.value))
const stock = computed(() => variantStock(product.value, colorId.value, size.value))
const maxQty = computed(() => stock.value ?? 99)
const colorOut = computed(() => color.value && !isColorAvailable(product.value, color.value))

// Changer de couleur : la galerie change (via color.images) et une taille devenue indisponible est retirée
watch(colorId, () => {
  if (size.value && !sizes.value.some((s) => s.label === size.value && s.available)) size.value = null
  errors.value = []
})
watch(stock, () => { if (quantity.value > maxQty.value) quantity.value = Math.max(1, maxQty.value) })
watch([size, quantity], () => { errors.value = [] })

const selection = () => ({ colorId: colorId.value, size: size.value, quantity: quantity.value })

function addToCart() {
  const r = cart.addItem(product.value, selection())
  if (!r.ok) return (errors.value = r.errors)
  errors.value = []
  ui.notify(`${product.value.name} ajouté au panier`)
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 1600)
}
function orderNow() {
  const v = validateSelection(product.value, selection())
  if (!v.ok) return (errors.value = v.errors)
  errors.value = []
  // Commande directe : uniquement ce produit, le panier n'est pas modifié
  ui.openOrder([{
    name: product.value.name, colorName: color.value.name, size: size.value, sizeLabel: size.value ? sLabel.value : null,
    quantity: quantity.value, price: price.value.price
  }])
}

const related = computed(() => {
  const p = product.value
  const same = products.filter((x) => x.id !== p.id && x.category === p.category)
  const others = products.filter((x) => x.id !== p.id && x.category !== p.category)
  return [...same, ...others].slice(0, 4)
})
watchEffect(() => { if (product.value) document.title = `${product.value.name} — ${shop.name}` })
</script>
<template>
  <div v-if="product" class="pdp" :style="{ '--tint': color.hex }">
  <div class="pdp-glow" aria-hidden="true"></div>
  <div class="container py-4 py-lg-5">
    <nav aria-label="Fil d'Ariane" class="mb-3 small">
      <RouterLink to="/boutique"><i class="bi bi-arrow-left"></i> Retour à la boutique</RouterLink>
      <span class="text-secondary"> / {{ categoryName(product.category) }}</span>
    </nav>
    <div class="row g-4 g-lg-5">
      <div class="col-lg-6"><ProductGallery :images="color.images" :name="`${product.name}, ${color.name}`" /></div>
      <div class="col-lg-6">
        <div class="mb-2 d-flex gap-2 flex-wrap">
          <span v-if="isNew(product)" class="badge-tag new">Nouveau</span>
          <span v-if="price.discount" class="badge-tag sale">Promotion -{{ price.discount }}%</span>
        </div>
        <p class="text-secondary mb-1">{{ categoryName(product.category) }}</p>
        <h1 class="h2">{{ product.name }}</h1>
        <p class="fs-4 mb-3"><span class="price">{{ formatPrice(price.price) }}</span><span v-if="price.oldPrice" class="price-old">{{ formatPrice(price.oldPrice) }}</span></p>
        <p>{{ product.description }}</p>

        <div class="d-grid gap-4 my-4">
          <ColorSelector v-model="colorId" :product="product" />
          <SizeSelector v-if="sLabel" v-model="size" :sizes="sizes" :label="sLabel" />
          <!-- <p v-if="colorOut" class="alert-soft mb-0">Cette couleur est actuellement indisponible.</p> -->
           <p v-else class="note-soft small mb-0"><i class="bi bi-chat-dots"></i> D’autres couleurs peuvent être disponibles : précisez la couleur souhaitée au vendeur sur WhatsApp.</p>
          <div>
            <span class="opt-label">Quantité</span>
            <QuantitySelector v-model="quantity" :max="maxQty" />
            <p v-if="stock !== null" class="small text-secondary mt-2 mb-0">Stock indiqué : {{ stock }}. Disponibilité confirmée par le vendeur.</p>
          </div>
        </div>

        <div v-if="errors.length" class="alert-soft mb-3" role="alert"><ul class="mb-0"><li v-for="e in errors" :key="e">{{ e }}</li></ul></div>

        <div class="d-grid gap-2 d-sm-flex">
          <button type="button" class="btn btn-ink flex-fill" :class="{ added: justAdded }" :disabled="colorOut" @click="addToCart"><i class="bi" :class="justAdded ? 'bi-check2-circle' : 'bi-bag-plus'"></i> {{ justAdded ? 'Ajouté au panier' : 'Ajouter au panier' }}</button>
          <button type="button" class="btn btn-gold flex-fill" :disabled="colorOut" @click="orderNow"><i class="bi bi-whatsapp"></i> Commander maintenant</button>
          <button type="button" class="btn btn-line" :aria-pressed="fav.has(product.id)" @click="fav.toggle(product)"><i class="bi" :class="fav.has(product.id) ? 'bi-heart-fill text-danger' : 'bi-heart'"></i><span class="d-sm-none ms-1">Favoris</span><span class="visually-hidden d-none d-sm-inline">Favoris</span></button>
        </div>

        <ul class="feature-list mt-4">
          <li v-for="f in product.features" :key="f">{{ f }}</li>
        </ul>
        <p class="note-soft small mt-3 mb-0">Prix et disponibilité à confirmer avec le vendeur lors de la commande.</p>
      </div>
    </div>

    <section class="mt-5 pt-3" aria-labelledby="rel-title">
      <div class="section-head"><h2 id="rel-title">Vous pourriez aussi aimer</h2></div>
      <ProductGrid :products="related" />
    </section>
  </div>
  </div>
  <EmptyState v-else icon="bi-emoji-frown" title="Produit introuvable" text="Ce produit n’existe pas ou n’est plus disponible.">
    <RouterLink to="/boutique" class="btn btn-ink">Retour à la boutique</RouterLink>
  </EmptyState>
</template>
