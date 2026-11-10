<script setup>
import { ref, computed } from 'vue'
import { products, getProductBySlug } from '../data/products.js'
import { categories } from '../data/categories.js'
import { collections, collectionProducts } from '../data/collections.js'
import { isNew, isOnSale } from '../utils/product.js'
import { onImgError } from '../utils/image.js'
import { useParallax } from '../composables/useParallax.js'
import ProductSlider from '../components/ProductSlider.vue'
import { shop } from '../config/shop.js'

const stage = ref(null)
useParallax(stage)

const byPopularity = (a, b) => (b.popularity || 0) - (a.popularity || 0)
const news = computed(() => products.filter(isNew).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12))
const picks = computed(() => products.filter((p) => p.featured))
const popular = computed(() => [...products].sort(byPopularity).slice(0, 12))
const promos = computed(() => products.filter(isOnSale))
const chapters = computed(() => categories.map((c) => ({ ...c, list: products.filter((p) => p.category === c.id).sort(byPopularity) })))
const collage = computed(() => ['vetements', 'chaussures', 'montres'].map((c) => products.find((p) => p.category === c)).filter(Boolean)
  .map((p) => ({ p, src: p.colors[0].images[2] ?? p.colors[0].images[0] })))
const marquee = categories.map((c) => c.name)
const collectionBanners = computed(() => collections.map((c) => ({ ...c, count: collectionProducts(c).length })).filter((c) => c.count))

const advantages = [
  { icon: 'bi-whatsapp', title: 'Commande par WhatsApp', text: 'Vous composez votre panier, puis vous échangez directement avec le vendeur.' },
  { icon: 'bi-palette2', title: 'Photos par couleur', text: 'Chaque couleur a ses propres photos : vous voyez ce que vous commandez.' },
  { icon: 'bi-rulers', title: 'Tailles et pointures', text: 'Les variantes indisponibles sont clairement signalées.' },
  { icon: 'bi-truck', title: 'Livraison à convenir', text: shop.delivery.note }
]

const floats = [
  { src: '/img/float-tshirt.jp', x: 0, y: 6, s: 46, r: -6, d: 0.8, t: 8 },
  { src: '/img/float-watch.jp', x: 52, y: 0, s: 42, r: 5, d: 1.6, t: 7 },
  { src: '/img/float-sneaker.jp', x: 24, y: 46, s: 52, r: 2, d: 1.2, t: 6.5 }
]
</script>
<template>
  <div>
   
    <section class="hero" aria-labelledby="hero-title">
      <div class="container wrap">
        <div>
          <h1 id="hero-title">
            <span class="ln"><span>Habillez</span></span>
            <span class="ln"><span class="grad-text">votre audace.</span></span>
          </h1>
          <p class="lead">{{ shop.tagline }}. Choisissez votre couleur, votre taille, puis envoyez votre commande au vendeur sur WhatsApp.</p>
          <div class="cta">
            <RouterLink to="/boutique" class="btn btn-gold btn-lg">Découvrir la collection</RouterLink>
            <RouterLink :to="{ path: '/boutique', query: { tri: 'newest' } }" class="btn btn-line btn-lg">Voir les nouveautés</RouterLink>
          </div>
        </div>
        <div ref="stage" class="stage" aria-hidden="true">
          <div v-for="f in floats" :key="f.src" class="fl" :style="{ '--x': f.x, '--y': f.y, '--s': f.s, '--d': f.d }">
            <!-- <div class="ph" :style="{ '--r': f.r + 'deg' }">
              <img :src="f.src" alt="" :style="{ '--t': f.t + 's' }" width="800" height="800" :fetchpriority="f.x === 24 ? 'high' : undefined" @error="onImgError" />
            </div> -->
          </div>
          <svg class="spin-badge" viewBox="0 0 120 120">
            <defs><path id="circ" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
            <text><textPath href="#circ">Nouvelle collection • Nouvelle collection •</textPath></text>
          </svg>
        </div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <span v-for="n in 4" :key="n" style="display: contents"><span v-for="c in marquee" :key="c + n">{{ c }}</span></span>
      </div>
    </div>

    <section v-if="news.length" class="section" aria-labelledby="news-title">
      <div class="container">
        <div class="section-head"><div><h2 id="news-title">Nouveautés</h2><p>Les derniers articles ajoutés</p></div><RouterLink :to="{ path: '/boutique', query: { tri: 'newest' } }" class="link-more">Tout voir</RouterLink></div>
        <ProductSlider :products="news" label="Nouveautés" autoplay />
      </div>
    </section>

    <section v-for="c in collectionBanners" :key="c.id" class="section pt-0" :style="{ '--a1': c.accent[0], '--a2': c.accent[1] }">
      <div class="container">
        <RouterLink :to="`/collection/${c.id}`" class="promo d-block text-decoration-none" v-reveal>
          <h2 class="grad-text" style="font-size: clamp(2.4rem, 9vw, 5rem)">{{ c.title }}</h2>
          <p class="text-secondary mb-3" style="max-width: 50ch">{{ c.description }} {{ c.count }} articles.</p>
          <span class="btn btn-gold">Découvrir la collection</span>
        </RouterLink>
      </div>
    </section>

    <!-- CHAPITRES : un slider par catégorie, mise en page asymétrique alternée -->
    <section v-for="(c, i) in chapters" :key="c.id" class="chapter" :class="{ rev: i % 2 }" :style="{ '--a1': c.accent[0], '--a2': c.accent[1] }" :aria-labelledby="`ch-${c.id}`">
      <div class="container">
        <div class="grid">
          <div class="chapter-text" v-reveal>
            <h2 :id="`ch-${c.id}`" class="chapter-title" :class="i % 2 ? 'grad-text' : 'outline-text'">{{ c.name }}</h2>
            <p>{{ c.description }}. {{ c.list.length }} articles à découvrir.</p>
            <RouterLink :to="`/categorie/${c.id}`" class="btn btn-gold">Voir {{ c.name.toLowerCase() }}</RouterLink>
          </div>
          <ProductSlider :products="c.list" :label="c.name" />
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="ed-title">
      <div class="container editorial">
        <div v-reveal>
          <h2 id="ed-title"><span class="outline-text">Chaque détail</span><br /><span class="grad-text">compte.</span></h2>
          <p class="text-secondary" style="max-width: 44ch">Couleurs, tailles, pointures : choisissez votre variante, vérifiez la photo exacte, puis envoyez votre commande en un seul message.</p>
          <RouterLink to="/boutique" class="btn btn-ink">Explorer la boutique</RouterLink>
        </div>
        <div class="collage">
          <RouterLink v-for="c in collage" :key="c.p.id" :to="`/produit/${c.p.slug}`" :aria-label="c.p.name"></RouterLink>
        </div>
      </div>
    </section>

    <section v-if="picks.length" class="section" aria-labelledby="picks-title">
      <div class="container">
        <div class="section-head"><div><h2 id="picks-title">Nos sélections</h2><p>Le choix de la boutique</p></div><RouterLink to="/boutique" class="link-more">Tout voir</RouterLink></div>
        <ProductSlider :products="picks" label="Nos sélections" autoplay />
      </div>
    </section>

    <section v-if="promos.length" class="section" aria-labelledby="promo-title">
      <div class="container">
        <div class="promo">
          <div class="section-head"><div><h2 id="promo-title" class="grad-text">Promotions</h2><p>Des prix réduits sur une sélection d’articles</p></div></div>
          <ProductSlider :products="promos" label="Promotions" />
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="pop-title">
      <div class="container">
        <div class="section-head"><div><h2 id="pop-title">Les plus populaires</h2><p>Les articles les plus consultés</p></div><RouterLink :to="{ path: '/boutique', query: { tri: 'popular' } }" class="link-more">Tout voir</RouterLink></div>
        <ProductSlider :products="popular" label="Les plus populaires" />
      </div>
    </section>

    <section class="section" aria-labelledby="adv-title">
      <div class="container">
        <div class="section-head"><h2 id="adv-title">Pourquoi commander ici</h2></div>
        <div class="row g-3">
          <div v-for="a in advantages" :key="a.title" v-reveal class="col-12 col-md-6 col-lg-3">
            <div class="advantage"><i class="bi" :class="a.icon" aria-hidden="true"></i><div><h3>{{ a.title }}</h3><p>{{ a.text }}</p></div></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>