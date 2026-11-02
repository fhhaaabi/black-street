<script setup>
import { computed, watch, nextTick, ref } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { buildOrderMessage, buildWhatsAppUrl, isWhatsAppConfigured } from '../services/whatsapp.js'
import { validateOrderLines } from '../utils/validation.js'

const ui = useUiStore()
const lines = computed(() => ui.order?.lines ?? [])
const check = computed(() => validateOrderLines(lines.value))
const configured = computed(() => isWhatsAppConfigured())
const message = computed(() => (check.value.ok ? buildOrderMessage(lines.value) : ''))
const url = computed(() => (check.value.ok && configured.value ? buildWhatsAppUrl(message.value) : '#'))
const canOpen = computed(() => check.value.ok && configured.value)
const closeBtn = ref(null)
watch(() => ui.order, async (o) => { if (o) { await nextTick(); closeBtn.value?.focus() } })

function onOpen(e) {
  if (!canOpen.value) return e.preventDefault()
  // On ne vide PAS le panier : rien ne prouve que le client enverra le message.
  ui.notify('WhatsApp s\u2019ouvre. Envoyez le message pour transmettre votre commande.', 'info', 5000)
  ui.closeOrder()
}
</script>
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.order" class="modal-back" @click.self="ui.closeOrder()" @keydown.esc="ui.closeOrder()">
        <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="order-title">
          <h2 id="order-title" class="h4"><i class="bi bi-whatsapp text-success"></i> Commander par WhatsApp</h2>
          <!-- <p class="note-soft small">
             <strong></strong> 
          </p> -->
          <div v-if="!check.ok" class="alert-soft mb-3" role="alert"><ul class="mb-0"><li v-for="e in check.errors" :key="e">{{ e }}</li></ul></div>
          <!-- <div v-else-if="!configured" class="alert-soft mb-3" role="alert">Le numéro WhatsApp de la boutique n’est pas encore configuré (fichier <code>src/config/shop.js</code>).</div> -->
          <template v-if="check.ok">
            <p class="fw-bold mb-1">Aperçu du message</p>
            <pre>{{ message }}</pre>
          </template>
          <div class="d-flex gap-2 justify-content-end flex-wrap">
            <button ref="closeBtn" type="button" class="btn btn-line" @click="ui.closeOrder()">Retour au site</button>
            <a class="btn btn-gold" :href="url" target="_blank" rel="noopener noreferrer" :aria-disabled="!canOpen" @click="onOpen"><i class="bi bi-whatsapp"></i> Ouvrir WhatsApp</a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
