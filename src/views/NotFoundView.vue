<script setup>
import EmptyState from '../components/EmptyState.vue'
</script>
<template>
  <div class="container py-5">
    <EmptyState icon="bi-compass" title="Page introuvable" text="L’adresse saisie n’existe pas ou a été déplacée.">
      <RouterLink to="/" class="btn btn-ink">Retour à l’accueil</RouterLink>
      <RouterLink to="/boutique" class="btn btn-line">Voir la boutique</RouterLink>
    </EmptyState>
  </div>
</template>
