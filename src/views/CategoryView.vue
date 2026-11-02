<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { shop } from '../config/shop.js'
import { products } from '../data/products.js'
import { categories, getCategory } from '../data/categories.js'
import { sortProducts } from '../utils/filters.js'
import PageHero from '../components/PageHero.vue'
import ProductSlider from '../components/ProductSlider.vue'
import ProductGrid from '../components/ProductGrid.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const cat = computed(() => getCategory(route.params.id))
const list = computed(() => products.filter((p) => p.category === cat.value?.id))
const top = computed(() => sortProducts(list.value, 'popular').slice(0, 8))
const news = computed(() => sortProducts(list.value, 'newest').slice(0, 8))
const sort = ref('relevance')
const sorted = computed(() => sortProducts(list.value, sort.value))
const sorts = [{ v: 'relevance', l: 'Pertinence' }, { v: 'price-asc', l: 'Prix croissant' }, { v: 'price-desc', l: 'Prix décroissant' }, { v: 'newest', l: 'Nouveautés' }, { v: 'popular', l: 'Popularité' }]
watchEffect(() => { if (cat.value) document.title = `${cat.value.name} — ${shop.name}` })
</script>
<template>
  <div v-if="cat" :style="{ '--a1': cat.accent[0], '--a2': cat.accent[1] }">
    <PageHero :title="cat.name" :text="`${cat.description}. ${list.length} articles.`">
      <div class="pills mt-4" role="navigation" aria-label="Catégories">
        <RouterLink v-for="c in categories" :key="c.id" :to="`/categorie/${c.id}`" class="pill" :class="{ on: c.id === cat.id }" :aria-current="c.id === cat.id ? 'page' : undefined">{{ c.name }}</RouterLink>
      </div>
    </PageHero>
    <section class="section" aria-labelledby="top-title">
      <div class="container">
        <div class="section-head"><div><h2 id="top-title">Les incontournables</h2><p>Les plus consultés de la catégorie</p></div></div>
        <ProductSlider :products="top" :label="`Les incontournables : ${cat.name}`" />
      </div>
    </section>
    <section class="section pt-0" aria-labelledby="new-title">
      <div class="container">
        <div class="section-head"><div><h2 id="new-title">Derniers arrivés</h2></div></div>
        <ProductSlider :products="news" :label="`Derniers arrivés : ${cat.name}`" />
      </div>
    </section>
    <section class="section pt-0" aria-labelledby="all-title">
      <div class="container">
        <div class="section-head">
          <div><h2 id="all-title">Tous les articles</h2><p>{{ list.length }} produits</p></div>
          <div class="d-flex align-items-center gap-2">
            <label for="csort" class="small text-secondary">Trier par</label>
            <select id="csort" v-model="sort" class="form-select" style="min-height: 44px; width: auto"><option v-for="s in sorts" :key="s.v" :value="s.v">{{ s.l }}</option></select>
          </div>
        </div>
        <ProductGrid :products="sorted" />
        <div class="mt-4"><RouterLink :to="{ path: '/boutique', query: { categorie: cat.id } }" class="btn btn-line">Affiner avec les filtres</RouterLink></div>
      </div>
    </section>
  </div>
  <EmptyState v-else icon="bi-compass" title="Catégorie introuvable" text="Cette catégorie n’existe pas.">
    <RouterLink to="/boutique" class="btn btn-ink">Voir la boutique</RouterLink>
  </EmptyState>
</template>
