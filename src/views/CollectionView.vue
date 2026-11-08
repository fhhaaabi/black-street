<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { shop } from '../config/shop.js'
import { categories } from '../data/categories.js'
import { getCollection, collectionProducts } from '../data/collections.js'
import { sortProducts } from '../utils/filters.js'
import PageHero from '../components/PageHero.vue'
import ProductSlider from '../components/ProductSlider.vue'
import ProductGrid from '../components/ProductGrid.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const col = computed(() => getCollection(route.params.id))
const all = computed(() => (col.value ? collectionProducts(col.value) : []))
const cat = ref('')
const sort = ref('relevance')
const present = computed(() => categories.filter((c) => all.value.some((p) => p.category === c.id)))
const list = computed(() => sortProducts(cat.value ? all.value.filter((p) => p.category === cat.value) : all.value, sort.value))
const top = computed(() => sortProducts(all.value, 'popular').slice(0, 10))
const sorts = [{ v: 'relevance', l: 'Notre sélection' }, { v: 'price-asc', l: 'Prix croissant' }, { v: 'price-desc', l: 'Prix décroissant' }, { v: 'newest', l: 'Nouveautés' }, { v: 'popular', l: 'Popularité' }]
watchEffect(() => { if (col.value) document.title = `${col.value.title} — ${shop.name}` })
</script>
<template>
  <div v-if="col" :style="{ '--a1': col.accent[0], '--a2': col.accent[1] }">
    <PageHero :title="col.title" :text="`${col.description} ${all.length} articles.`" />
    <section v-if="top.length" class="section" aria-labelledby="col-top">
      <div class="container">
        <div class="section-head"><div><h2 id="col-top">Les coups de cœur</h2><p>Les plus consultés de la collection</p></div></div>
        <ProductSlider :products="top" :label="`Coups de cœur : ${col.title}`" />
      </div>
    </section>
    <section class="section pt-0" aria-labelledby="col-all">
      <div class="container">
        <div class="section-head">
          <div><h2 id="col-all">Toute la collection</h2><p>{{ list.length }} produit{{ list.length > 1 ? 's' : '' }}</p></div>
          <div class="d-flex align-items-center gap-2">
            <label for="colsort" class="small text-secondary">Trier par</label>
            <select id="colsort" v-model="sort" class="form-select" style="min-height: 44px; width: auto"><option v-for="s in sorts" :key="s.v" :value="s.v">{{ s.l }}</option></select>
          </div>
        </div>
        <div v-if="present.length > 1" class="pills mb-4" role="group" aria-label="Filtrer par catégorie">
          <button type="button" class="pill" :class="{ on: !cat }" :aria-pressed="!cat" @click="cat = ''">Tout</button>
          <button v-for="c in present" :key="c.id" type="button" class="pill" :class="{ on: cat === c.id }" :aria-pressed="cat === c.id" @click="cat = c.id">{{ c.name }}</button>
        </div>
        <ProductGrid v-if="list.length" :products="list" />
        <EmptyState v-else icon="bi-bag" title="Aucun produit" text="Cette collection est vide pour le moment." />
      </div>
    </section>
  </div>
  <EmptyState v-else icon="bi-compass" title="Collection introuvable" text="Cette collection n’existe pas.">
    <RouterLink to="/boutique" class="btn btn-ink">Voir la boutique</RouterLink>
  </EmptyState>
</template>