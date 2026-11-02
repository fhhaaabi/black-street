<script setup>
import { useUiStore } from '../stores/ui.js'
const ui = useUiStore()
const icons = { success: 'bi-check-circle-fill', info: 'bi-info-circle-fill', warning: 'bi-exclamation-triangle-fill' }
</script>
<template>
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="toast-item" :class="t.type" role="status">
        <i class="bi" :class="icons[t.type] || icons.info" aria-hidden="true"></i>
        <span class="flex-grow-1">{{ t.message }}</span>
        <button class="btn-close btn-close-white" aria-label="Fermer" @click="ui.dismiss(t.id)"></button>
      </div>
    </TransitionGroup>
  </div>
</template>
