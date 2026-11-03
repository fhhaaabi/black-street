<script setup>
import { computed, reactive, ref, watch, nextTick, useId } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { buildOrderMessage, buildWhatsAppUrl, isWhatsAppConfigured } from '../services/whatsapp.js'
import { validateOrderLines, validateCustomer } from '../utils/validation.js'
import { load, save } from '../services/storage.js'

const ui = useUiStore()
const uid = useId()

// Coordonnées : mémorisées uniquement dans ce navigateur, pour ne pas les retaper
const customer = reactive(load('customer', { name: '', phone: '', address: '' }, (v) =>
  v && typeof v === 'object' ? { name: String(v.name || ''), phone: String(v.phone || ''), address: String(v.address || '') } : null))
watch(customer, (v) => save('customer', { ...v }), { deep: true })

const tried = ref(false)
const lines = computed(() => ui.order?.lines ?? [])
const check = computed(() => validateOrderLines(lines.value))
const cust = computed(() => validateCustomer(customer))
const configured = computed(() => isWhatsAppConfigured())
const clean = computed(() => ({ name: customer.name.trim(), phone: customer.phone.trim(), address: customer.address.trim() }))
const preview = computed(() => (check.value.ok
  ? buildOrderMessage(lines.value, { name: clean.value.name || '…', phone: clean.value.phone || '…', address: clean.value.address || '…' })
  : ''))
const message = computed(() => (check.value.ok && cust.value.ok ? buildOrderMessage(lines.value, clean.value) : ''))
const canOpen = computed(() => check.value.ok && cust.value.ok && configured.value)
const url = computed(() => (canOpen.value ? buildWhatsAppUrl(message.value) : '#'))
const canShare = typeof navigator !== 'undefined' && !!navigator.share
const sharing = ref(false)
const closeBtn = ref(null)
watch(() => ui.order, async (o) => { if (o) { tried.value = false; await nextTick(); closeBtn.value?.focus() } })

function onOpen(e) {
  tried.value = true
  if (!canOpen.value) return e.preventDefault()
  // On ne vide PAS le panier : rien ne prouve que le client enverra le message.
  ui.notify('WhatsApp s\u2019ouvre. Envoyez le message pour transmettre votre commande.', 'info', 5000)
  ui.closeOrder()
}

// Téléphone : envoie les vraies photos + le message via le menu de partage (le client choisit la discussion du vendeur)
async function shareWithPhotos() {
  tried.value = true
  if (!check.value.ok || !cust.value.ok) return
  sharing.value = true
  try {
    const srcs = [...new Set(lines.value.map((l) => l.image).filter(Boolean))].slice(0, 5)
    const files = []
    for (const src of srcs) {
      const r = await fetch(src)
      if (!r.ok) continue
      const b = await r.blob()
      files.push(new File([b], src.split('/').pop(), { type: b.type || 'image/jpeg' }))
    }
    const data = { text: message.value, title: 'Commande' }
    if (files.length && navigator.canShare?.({ files })) data.files = files
    await navigator.share(data)
    ui.notify('Choisissez la discussion du vendeur dans WhatsApp, puis envoyez.', 'info', 6000)
  } catch (e) {
    if (e?.name !== 'AbortError') ui.notify('Le partage a échoué. Utilisez « Ouvrir WhatsApp ».', 'warning', 5000)
  } finally {
    sharing.value = false
  }
}
</script>
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.order" class="modal-back" @click.self="ui.closeOrder()" @keydown.esc="ui.closeOrder()">
        <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="order-title">
          <h2 id="order-title" class="h4"><i class="bi bi-whatsapp text-success"></i> Commander par WhatsApp</h2>
          <p class="note-soft small">
            Votre commande n’est transmise que lorsque vous appuyez vous-même sur « Envoyer » dans WhatsApp. Le vendeur confirmera ensuite la disponibilité, le prix final et la livraison.
          </p>

          <div v-if="!check.ok" class="alert-soft mb-3" role="alert"><ul class="mb-0"><li v-for="e in check.errors" :key="e">{{ e }}</li></ul></div>

          <template v-else>
            <p class="fw-bold mb-2">Vos coordonnées</p>
            <div class="mb-2">
              <label :for="uid + 'n'" class="form-label small mb-1">Nom</label>
              <input :id="uid + 'n'" v-model="customer.name" class="form-control" :class="{ 'is-invalid': tried && cust.errors.name }" autocomplete="name" />
              <div v-if="tried && cust.errors.name" class="invalid-feedback d-block">{{ cust.errors.name }}</div>
            </div>
            <div class="mb-2">
              <label :for="uid + 'p'" class="form-label small mb-1">Téléphone</label>
              <input :id="uid + 'p'" v-model="customer.phone" class="form-control" :class="{ 'is-invalid': tried && cust.errors.phone }" type="tel" inputmode="tel" autocomplete="tel" />
              <div v-if="tried && cust.errors.phone" class="invalid-feedback d-block">{{ cust.errors.phone }}</div>
            </div>
            <div class="mb-2">
              <label :for="uid + 'a'" class="form-label small mb-1">Adresse ou quartier de livraison</label>
              <input :id="uid + 'a'" v-model="customer.address" class="form-control" :class="{ 'is-invalid': tried && cust.errors.address }" autocomplete="street-address" />
              <div v-if="tried && cust.errors.address" class="invalid-feedback d-block">{{ cust.errors.address }}</div>
            </div>
            <p class="small text-secondary">Ces informations restent sur votre appareil et sont seulement ajoutées au message.</p>

            <div v-if="!configured" class="alert-soft mb-3" role="alert">Le numéro WhatsApp de la boutique n’est pas encore configuré (fichier <code>src/config/shop.js</code>). Le bouton « Envoyer avec les photos » reste utilisable.</div>

            <p class="fw-bold mb-1">Aperçu du message</p>
            <pre>{{ preview }}</pre>
          </template>

          <div class="d-flex gap-2 justify-content-end flex-wrap">
            <button ref="closeBtn" type="button" class="btn btn-line" @click="ui.closeOrder()">Retour au site</button>
            <button v-if="canShare && check.ok" type="button" class="btn btn-ink" :disabled="sharing" @click="shareWithPhotos"><i class="bi bi-images"></i> Envoyer avec les photos</button>
            <a class="btn btn-gold" :href="url" target="_blank" rel="noopener noreferrer" :aria-disabled="!check.ok || (tried && !canOpen)" @click="onOpen"><i class="bi bi-whatsapp"></i> Ouvrir WhatsApp</a>
          </div>
          <p v-if="canShare && check.ok" class="small text-secondary mt-3 mb-0">« Envoyer avec les photos » : le téléphone ouvre son menu de partage ; choisissez WhatsApp puis la discussion du vendeur. « Ouvrir WhatsApp » envoie le texte directement au vendeur.</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>