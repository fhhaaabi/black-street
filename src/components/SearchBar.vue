<script setup>
import { ref, watch, useId, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const props = defineProps({ autofocus: Boolean })
const route = useRoute(), router = useRouter()
const id = useId()
const input = ref(null)
const q = ref(String(route.query.q || ''))
watch(() => route.query.q, (v) => { q.value = String(v || '') })
onMounted(() => { if (props.autofocus) input.value?.focus() })
function submit() {
  const term = q.value.trim()
  router.push({ path: '/boutique', query: term ? { q: term } : {} })
}
</script>
<template>
  <form class="search" role="search" @submit.prevent="submit">
    <label :for="id" class="visually-hidden">Rechercher un produit</label>
    <input :id="id" ref="input" v-model="q" type="search" placeholder="Rechercher un produit, une catégorie…" autocomplete="off" enterkeyhint="search" />
    <button type="submit" aria-label="Lancer la recherche"><i class="bi bi-search" aria-hidden="true"></i></button>
  </form>
</template>
