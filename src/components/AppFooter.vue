<script setup>
import { shop } from '../config/shop.js'
import { categories } from '../data/categories.js'
import { collections } from '../data/collections.js'
import { buildChatUrl, isWhatsAppConfigured } from '../services/whatsapp.js'
const s = shop.seller
</script>
<template>
  <footer class="site-footer">
    <div class="container">
      <p class="wordmark" aria-hidden="true">{{ shop.name }}</p>
      <div class="row g-4">
        <div class="col-lg-4">
          <h3>{{ shop.name }}</h3>
          <p>{{ shop.tagline }}</p>
          <p v-if="shop.delivery.note" class="small">{{ shop.delivery.note }}</p>
        </div>
        <div class="col-6 col-lg-2">
          <h3>Boutique</h3>
          <ul>
            <li v-for="c in categories" :key="c.id"><RouterLink :to="`/categorie/${c.id}`">{{ c.name }}</RouterLink></li>
            <li v-for="c in collections" :key="c.id"><RouterLink :to="`/collection/${c.id}`">Collection {{ c.name }}</RouterLink></li>
            <li><RouterLink to="/favoris">Mes favoris</RouterLink></li>
            <li><RouterLink to="/panier">Mon panier</RouterLink></li>
          </ul>
        </div>
        <div class="col-6 col-lg-3">
          <h3>Contact</h3>
          <ul>
            <li>{{ s.name }}</li>
            <li v-if="s.address">{{ s.address }}</li>
            <li v-if="s.hours">{{ s.hours }}</li>
            <li v-if="s.phone"><a :href="`tel:${s.phone}`">{{ s.phone }}</a></li>
            <li v-if="s.email"><a :href="`mailto:${s.email}`">{{ s.email }}</a></li>
            <li v-if="isWhatsAppConfigured()"><a :href="buildChatUrl()" target="_blank" rel="noopener noreferrer"><i class="bi bi-whatsapp"></i> Écrire sur WhatsApp</a></li>
          </ul>
        </div>
        <div class="col-lg-3">
          <h3>Conditions de vente</h3>
          <ul class="small"><li v-for="t in shop.terms" :key="t">{{ t }}</li></ul>
        </div>
      </div>
      <p class="small mt-4 mb-0 opacity-75">Votre panier et vos favoris sont enregistrés uniquement dans ce navigateur.</p>
    </div>
  </footer>
</template>