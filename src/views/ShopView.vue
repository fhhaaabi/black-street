<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { products } from '../data/products.js'
import { categories } from '../data/categories.js'
import { defaultFilters, filterProducts, sortProducts, compareSizes } from '../utils/filters.js'
import ProductGrid from '../components/ProductGrid.vue'
import ProductFilters from '../components/ProductFilters.vue'
import EmptyState from '../components/EmptyState.vue'
import PageHero from '../components/PageHero.vue'

const route = useRoute(), router = useRouter()
const showFilters = ref(false)
const fromQuery = () => ({
  ...defaultFilters(),
  q: String(route.query.q || ''),
  category: categories.some((c) => c.id === route.query.categorie) ? String(route.query.categorie) : '',
  sort: ['price-asc', 'price-desc', 'newest', 'popular'].includes(route.query.tri) ? String(route.query.tri) : 'relevance'
})
const filters = ref(fromQuery())

// URL → filtres (recherche depuis l'en-tête, liens de catégories)
watch(() => route.query, () => {
  const n = fromQuery()
  if (n.q !== filters.value.q || n.category !== filters.value.category || n.sort !== filters.value.sort) {
    filters.value = { ...filters.value, q: n.q, category: n.category, sort: n.sort }
  }
})
// Filtres → URL (liens partageables)
watch(() => [filters.value.q, filters.value.category, filters.value.sort], ([q, categorie, sort]) => {
  const query = {}
  if (q) query.q = q
  if (categorie) query.categorie = categorie
  if (sort !== 'relevance') query.tri = sort
  if (JSON.stringify(query) !== JSON.stringify(route.query)) router.replace({ query })
})

const inScope = computed(() => (filters.value.category ? products.filter((p) => p.category === filters.value.category) : products))
const sizeOptions = computed(() => [...new Set(inScope.value.flatMap((p) => p.colors.flatMap((c) => c.sizes.map((s) => s.label))))].sort(compareSizes))
const colorOptions = computed(() => {
  const m = new Map()
  inScope.value.forEach((p) => p.colors.forEach((c) => m.set(c.id, { id: c.id, name: c.name, hex: c.hex })))
  return [...m.values()]
})
// Une taille / couleur qui n'existe plus dans la catégorie choisie est retirée
watch([sizeOptions, colorOptions], () => {
  const f = filters.value
  if (f.size && !sizeOptions.value.includes(f.size)) filters.value = { ...f, size: '' }
  if (f.color && !colorOptions.value.some((c) => c.id === f.color)) filters.value = { ...filters.value, color: '' }
})

const results = computed(() => sortProducts(filterProducts(products, filters.value), filters.value.sort))
const reset = () => { filters.value = defaultFilters() }
const sorts = [
  { v: 'relevance', l: 'Pertinence' }, { v: 'price-asc', l: 'Prix croissant' }, { v: 'price-desc', l: 'Prix décroissant' },
  { v: 'newest', l: 'Nouveautés' }, { v: 'popular', l: 'Popularité' }
]
onMounted(() => { document.title = 'Boutique — Maison Aurore' })
</script>
<template>
  <div>
    <PageHero title="Toute la collection" a1="#8b5cf6" a2="#ff5a1f"
      :text="`${results.length} produit${results.length > 1 ? 's' : ''}${filters.q ? ' pour « ' + filters.q + ' »' : ''}`" />
    <p class="visually-hidden" aria-live="polite">{{ results.length }} produit{{ results.length > 1 ? 's' : '' }} affiché{{ results.length > 1 ? 's' : '' }}</p>
    <div class="container py-4 py-lg-5">
      <div class="d-flex gap-2 align-items-center mb-3 flex-wrap">
        <button type="button" class="btn btn-line d-lg-none" :aria-expanded="showFilters" @click="showFilters = true"><i class="bi bi-sliders"></i> Filtres</button>
        <div class="ms-auto d-flex align-items-center gap-2">
          <label for="sort" class="small text-secondary">Trier par</label>
          <select id="sort" class="form-select" style="min-height: 44px; width: auto" :value="filters.sort" @change="filters = { ...filters, sort: $event.target.value }">
            <option v-for="s in sorts" :key="s.v" :value="s.v">{{ s.l }}</option>
          </select>
        </div>
      </div>
      <Transition name="fade"><div v-if="showFilters" class="drawer-backdrop d-lg-none" style="z-index: 2050" @click="showFilters = false"></div></Transition>
      <div class="row g-4">
        <div class="col-lg-3">
          <ProductFilters v-model="filters" :categories="categories" :size-options="sizeOptions" :color-options="colorOptions" :open="showFilters" :count="results.length" @reset="reset" @close="showFilters = false" />
        </div>
        <div class="col-lg-9">
          <ProductGrid v-if="results.length" :products="results" class="row-cols-xl-3" />
          <EmptyState v-else icon="bi-search" title="Aucun produit ne correspond" text="Essayez d’autres mots-clés ou retirez certains filtres.">
            <button type="button" class="btn btn-ink" @click="reset">Réinitialiser les filtres</button>
          </EmptyState>
        </div>
      </div>
    </div>
  </div>
</template>
