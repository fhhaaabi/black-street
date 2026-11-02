<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getProductById } from '../data/products.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { useCartStore } from '../stores/cart.js'
import { useUiStore } from '../stores/ui.js'
import { isColorAvailable, isProductAvailable, sizeLabel } from '../utils/product.js'
import ProductGrid from '../components/ProductGrid.vue'
import EmptyState from '../components/EmptyState.vue'
import PageHero from '../components/PageHero.vue'

const fav = useFavoritesStore(), cart = useCartStore(), ui = useUiStore(), router = useRouter()
const items = computed(() => fav.ids.map(getProductById).filter(Boolean))

// Ajout direct seulement s'il n'y a rien à choisir ; sinon on ouvre la fiche pour choisir couleur/taille.
const needsChoice = (p) => p.colors.length > 1 || !!sizeLabel(p)
function addToCart(p) {
  if (needsChoice(p)) {
    ui.notify('Choisissez d\u2019abord votre couleur et votre taille.', 'info')
    return router.push(`/produit/${p.slug}`)
  }
  const r = cart.addItem(p, { colorId: p.colors[0].id, size: null, quantity: 1 })
  if (r.ok) ui.notify(`${p.name} ajouté au panier`)
  else ui.notify(r.errors[0], 'warning')
}
</script>
<template>
  <div>
  <PageHero compact title="Mes favoris" a1="#ff2d95" a2="#8b5cf6"
    :text="items.length ? `${items.length} article${items.length > 1 ? 's' : ''} enregistré${items.length > 1 ? 's' : ''} dans ce navigateur` : 'Vos coups de cœur, enregistrés dans ce navigateur'" />
  <div class="container py-4 py-lg-5">
    <ProductGrid v-if="items.length" :products="items">
      <template #actions="{ product }">
        <div class="d-grid gap-2 mt-2">
          <button type="button" class="btn btn-ink" :disabled="!isProductAvailable(product)" @click="addToCart(product)"><i class="bi bi-bag-plus"></i> {{ needsChoice(product) ? 'Choisir les options' : 'Ajouter au panier' }}</button>
          <button type="button" class="btn btn-line" @click="fav.remove(product.id)"><i class="bi bi-trash3"></i> Supprimer</button>
        </div>
      </template>
    </ProductGrid>
    <EmptyState v-else icon="bi-heart" title="Aucun favori pour l’instant" text="Touchez le cœur d’un produit pour le retrouver ici plus tard.">
      <RouterLink to="/boutique" class="btn btn-ink">Continuer mes achats</RouterLink>
    </EmptyState>
    <div v-if="items.length" class="mt-4"><RouterLink to="/boutique" class="btn btn-line">Continuer mes achats</RouterLink></div>
  </div>
  </div>
</template>
