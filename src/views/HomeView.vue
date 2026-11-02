<script setup>
import { ref, computed } from 'vue'
import { products, getProductBySlug } from '../data/products.js'
import { categories } from '../data/categories.js'
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
const collage = computed(() => ['sweat-a-capuche', 'baskets-urbaines', 'montre-classique'].map(getProductBySlug).filter(Boolean)
  .map((p) => ({ p, src: p.colors[0].images[2] })))
const marquee = categories.map((c) => c.name)

const advantages = [
  { icon: 'bi-whatsapp', title: 'Commande par WhatsApp', text: 'Vous composez votre panier, puis vous échangez directement avec le vendeur.' },
  { icon: 'bi-palette2', title: 'Photos par couleur', text: 'Chaque couleur a ses propres photos : vous voyez ce que vous commandez.' },
  { icon: 'bi-rulers', title: 'Tailles et pointures', text: 'Les variantes indisponibles sont clairement signalées.' },
  { icon: 'bi-truck', title: 'Livraison à convenir', text: shop.delivery.note }
]
const floats = [
  { img: 'sneaker', x: 20, y: 24, s: 62, d: 1.3, t: 6.5 },
   { img: 'hoodie', x: 2, y: -2, s: 62, d: 1.7, t: 9.5 },
  { img: 'watch', x: 60, y: -2, s: 36, d: 1.7, t: 7 },
  //  { img: 'glasses', x: 64, y: 54, s: 34, d: 1, t: 5.5 },
  // { img: 'cap', x: 0, y: 56, s: 32, d: 1.5, t: 7.5 }, 
  { img: 'bag', x: 36, y: 64, s: 30, d: 0.5, t: 9 }
]
</script>
<template>
  <div>
    <!-- HERO : mise en scène façon campagne, produits flottants en parallaxe -->
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
           <!-- npm -->
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
          <RouterLink v-for="c in collage" :key="c.p.id" :to="`/produit/${c.p.slug}`" :aria-label="c.p.name"><img :src="c.src" :alt="c.p.name" loading="lazy" width="800" height="800" @error="onImgError" /></RouterLink>
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
