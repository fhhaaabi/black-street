<script setup>
import { useId } from 'vue'
const props = defineProps({
  categories: Array, sizeOptions: Array, colorOptions: Array, open: Boolean, count: Number
})
const f = defineModel({ required: true })
const emit = defineEmits(['reset', 'close'])
const uid = useId()
const set = (k, v) => { f.value = { ...f.value, [k]: v } }
const toNum = (v) => (v === '' || v === null ? null : Math.max(0, Number(v)))
</script>
<template>
  <aside class="filters" :class="{ open }" aria-label="Filtres" :aria-hidden="undefined">
    <div class="d-flex justify-content-between align-items-center d-lg-none mb-3">
      <h2 class="h4 m-0">Filtres</h2>
      <button type="button" class="btn-icon" aria-label="Fermer les filtres" @click="emit('close')"><i class="bi bi-x-lg"></i></button>
    </div>

    <h3>Catégorie</h3>
    <div class="pills">
      <button type="button" class="pill" :class="{ on: !f.category }" @click="set('category', '')">Toutes</button>
      <button v-for="c in categories" :key="c.id" type="button" class="pill" :class="{ on: f.category === c.id }" :aria-pressed="f.category === c.id" @click="set('category', c.id)">{{ c.name }}</button>
    </div>

    <h3>Prix (FCFA)</h3>
    <div class="d-flex gap-2 align-items-center">
      <label :for="uid + 'min'" class="visually-hidden">Prix minimum</label>
      <input :id="uid + 'min'" class="form-control" type="number" min="0" inputmode="numeric" placeholder="Min" :value="f.minPrice" @input="set('minPrice', toNum($event.target.value))" />
      <span aria-hidden="true">–</span>
      <label :for="uid + 'max'" class="visually-hidden">Prix maximum</label>
      <input :id="uid + 'max'" class="form-control" type="number" min="0" inputmode="numeric" placeholder="Max" :value="f.maxPrice" @input="set('maxPrice', toNum($event.target.value))" />
    </div>

    <template v-if="sizeOptions.length">
      <h3>Taille / pointure</h3>
      <div class="pills">
        <button v-for="s in sizeOptions" :key="s" type="button" class="pill" :class="{ on: f.size === s }" :aria-pressed="f.size === s" @click="set('size', f.size === s ? '' : s)">{{ s }}</button>
      </div>
    </template>

    <template v-if="colorOptions.length">
      <h3>Couleur</h3>
      <div class="pills">
        <button v-for="c in colorOptions" :key="c.id" type="button" class="color-dot" :class="{ on: f.color === c.id }" :style="{ background: c.hex }" :aria-pressed="f.color === c.id" :aria-label="c.name" :title="c.name" @click="set('color', f.color === c.id ? '' : c.id)"></button>
      </div>
    </template>

    <div class="form-check form-switch mt-4">
      <input :id="uid + 'stock'" class="form-check-input" type="checkbox" role="switch" :checked="f.inStock" @change="set('inStock', $event.target.checked)" />
      <label class="form-check-label" :for="uid + 'stock'">Disponibles uniquement</label>
    </div>

    <div class="d-flex gap-2 mt-4">
      <button type="button" class="btn btn-line flex-grow-1" @click="emit('reset')">Réinitialiser</button>
      <button type="button" class="btn btn-ink d-lg-none flex-grow-1" @click="emit('close')">Voir {{ count }} produit{{ count > 1 ? 's' : '' }}</button>
    </div>
  </aside>
</template>
