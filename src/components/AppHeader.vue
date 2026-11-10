

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { shop } from '../config/shop.js'
import { categories } from '../data/categories.js'
import { collections } from '../data/collections.js'
import { useCartStore } from '../stores/cart.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { useUiStore } from '../stores/ui.js'
import SearchBar from './SearchBar.vue'

const route = useRoute()
const cart = useCartStore(), fav = useFavoritesStore(), ui = useUiStore()
const menuOpen = ref(false), searchOpen = ref(false), ddOpen = ref(false)
const ddRoot = ref(null), ddBtn = ref(null)
const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
let closeTimer

watch(() => route.fullPath, () => { menuOpen.value = false; searchOpen.value = false; ddOpen.value = false })
watch(menuOpen, (o) => { document.body.style.overflow = o ? 'hidden' : '' })
const hoverOpen = () => { if (fine()) { clearTimeout(closeTimer); ddOpen.value = true } }
const hoverClose = () => { if (fine()) closeTimer = setTimeout(() => (ddOpen.value = false), 180) }
function onKey(e) {
  if (e.key !== 'Escape') return
  if (ddOpen.value) { ddOpen.value = false; ddBtn.value?.focus() }
  menuOpen.value = false; searchOpen.value = false
}
const onDocClick = (e) => { if (ddOpen.value && ddRoot.value && !ddRoot.value.contains(e.target)) ddOpen.value = false }
onMounted(() => { window.addEventListener('keydown', onKey); document.addEventListener('click', onDocClick) })
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey); document.removeEventListener('click', onDocClick)
  document.body.style.overflow = ''; clearTimeout(closeTimer)
})
</script>
<template>
  <div v-if="shop.announcement && !ui.announcementHidden" class="announce">
    <div class="container">
      <span>{{ shop.announcement }}</span>
      <button type="button" aria-label="Masquer l'annonce" @click="ui.announcementHidden = true"><i class="bi bi-x-lg"></i></button>
    </div>
  </div>
  <header class="site-header">
    <div class="container">
      <div class="bar">
        <button type="button" class="btn-icon d-lg-none" aria-label="Ouvrir le menu" :aria-expanded="menuOpen" aria-controls="mobile-menu" @click="menuOpen = true"><i class="bi bi-list"></i></button>
        <RouterLink to="/" class="brand me-lg-3"><img :src="shop.logo" alt="" width="36" height="36" /><span>{{ shop.name }}</span></RouterLink>
        <nav class="nav-links d-none d-lg-flex" aria-label="Navigation principale">
          <RouterLink to="/">Accueil</RouterLink>
          <RouterLink to="/boutique">Boutique</RouterLink>
          <RouterLink v-for="c in collections" :key="c.id" :to="`/collection/${c.id}`">{{ c.name }}</RouterLink>
          <div ref="ddRoot" class="dd" @mouseenter="hoverOpen" @mouseleave="hoverClose">
            <button ref="ddBtn" type="button" class="nav-btn" aria-haspopup="true" :aria-expanded="ddOpen" aria-controls="cat-menu" @click="ddOpen = !ddOpen">
              Catégories <i class="bi bi-chevron-down" aria-hidden="true"></i>
            </button>
            <Transition name="slide">
              <ul v-if="ddOpen" id="cat-menu" class="dd-menu">
                <li v-for="c in categories" :key="c.id">
                  <RouterLink :to="`/categorie/${c.id}`"><span class="dd-dot" :style="{ background: `linear-gradient(135deg, ${c.accent[0]}, ${c.accent[1]})` }"></span>{{ c.name }}</RouterLink>
                </li>
              </ul>
            </Transition>
          </div>
        </nav>
        <div class="d-none d-lg-block flex-grow-1 mx-3" style="max-width: 440px; margin-left: auto !important"><SearchBar /></div>
        <div class="d-flex ms-auto ms-lg-0">
          <button type="button" class="btn-icon d-lg-none" aria-label="Rechercher" :aria-expanded="searchOpen" @click="searchOpen = !searchOpen"><i class="bi bi-search"></i></button>
          <RouterLink to="/favoris" class="btn-icon" :aria-label="`Favoris (${fav.count})`"><i class="bi bi-heart"></i>
            <Transition name="pop" mode="out-in"><span v-if="fav.count" :key="fav.count" class="badge-count">{{ fav.count }}</span></Transition>
          </RouterLink>
          <RouterLink to="/panier" class="btn-icon" :aria-label="`Panier (${cart.count} article${cart.count > 1 ? 's' : ''})`"><i class="bi bi-bag"></i>
            <Transition name="pop" mode="out-in"><span v-if="cart.count" :key="cart.count" class="badge-count">{{ cart.count }}</span></Transition>
          </RouterLink>
        </div>
      </div>
      <Transition name="slide"><div v-if="searchOpen" class="mobile-search d-lg-none"><SearchBar autofocus /></div></Transition>
    </div>
  </header>
  <Transition name="drawer">
    <div v-if="menuOpen" class="drawer-backdrop d-lg-none" @click="menuOpen = false">
      <nav id="mobile-menu" class="drawer" aria-label="Menu mobile" @click.stop>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="brand">{{ shop.name }}</span>
          <button type="button" class="btn-icon" aria-label="Fermer le menu" @click="menuOpen = false"><i class="bi bi-x-lg"></i></button>
        </div>
        <RouterLink to="/"><i class="bi bi-house"></i>Accueil</RouterLink>
        <RouterLink to="/boutique"><i class="bi bi-grid"></i>Boutique</RouterLink>
        <RouterLink v-for="c in collections" :key="c.id" :to="`/collection/${c.id}`"><i class="bi bi-stars"></i>{{ c.name }}</RouterLink>
        <p class="sub">Catégories</p>
        <div class="sub-links">
          <RouterLink v-for="c in categories" :key="c.id" :to="`/categorie/${c.id}`"><span class="dd-dot" :style="{ background: `linear-gradient(135deg, ${c.accent[0]}, ${c.accent[1]})` }"></span>{{ c.name }}</RouterLink>
        </div>
        <RouterLink to="/favoris" class="mt-2"><i class="bi bi-heart"></i>Favoris</RouterLink>
        <RouterLink to="/panier"><i class="bi bi-bag"></i>Panier</RouterLink>
      </nav>
    </div>
  </Transition>
</template>