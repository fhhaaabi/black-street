<script setup>
import { computed, reactive, ref, watch, nextTick, useId } from 'vue'
import { shop } from '../config/shop.js'
import { useUiStore } from '../stores/ui.js'
import { useCartStore } from '../stores/cart.js'
import { buildOrderMessage } from '../services/whatsapp.js' // sert seulement à afficher le récapitulatif
import { validateOrderLines, validateCustomer } from '../utils/validation.js'
import { load, save } from '../services/storage.js'
const ui = useUiStore()
const cart = useCartStore()
const uid = useId()
const endpoint = shop.orderEndpoint || '/.netlify/functions/order' 

// Coordonnées : mémorisées uniquement dans ce navigateur, pour ne pas les retaper
const customer = reactive(load('customer', { name: '', phone: '', address: '' }, (v) =>
  v && typeof v === 'object' ? { name: String(v.name || ''), phone: String(v.phone || ''), address: String(v.address || '') } : null))
watch(customer, (v) => save('customer', { ...v }), { deep: true })

const tried = ref(false)
const sending = ref(false)
const sentRef = ref('')
const sendError = ref('')
const sendDetail = ref('')
const closeBtn = ref(null)
const lines = computed(() => ui.order?.lines ?? [])
const check = computed(() => validateOrderLines(lines.value))
const cust = computed(() => validateCustomer(customer))
const clean = computed(() => ({ name: customer.name.trim(), phone: customer.phone.trim(), address: customer.address.trim() }))
const preview = computed(() => (check.value.ok
  ? buildOrderMessage(lines.value, { name: clean.value.name || '…', phone: clean.value.phone || '…', address: clean.value.address || '…' })
  : ''))

watch(() => ui.order, async (o) => {
  if (o) { tried.value = false; sentRef.value = ''; sendError.value = ''; sendDetail.value = ''; await nextTick(); closeBtn.value?.focus() }
})

async function sendToShop() {
  tried.value = true
  sendError.value = ''
  sendDetail.value = ''
  if (!check.value.ok || !cust.value.ok) return
  sending.value = true
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customer: clean.value,
        website: '', // champ piège anti-robots : doit rester vide
        lines: lines.value.map((l) => ({ productId: l.productId, slug: l.slug, name: l.name, colorId: l.colorId, colorName: l.colorName, size: l.size, quantity: l.quantity }))
      })
    })
    const isJson = (res.headers.get('content-type') || '').includes('json')
    const data = isJson ? await res.json().catch(() => ({})) : {}
    if (!res.ok || !data.ok) {
      sendDetail.value = data.detail || ''
      if (!isJson) throw new Error(`Le service d’envoi n’est pas disponible (erreur ${res.status}). La fonction « order » n’est probablement pas publiée sur Netlify.`)
      throw new Error(data.error || `Envoi impossible (erreur ${res.status}).`)
    }
    // Le serveur a confirmé : la commande est bien partie → on vide le panier si la commande venait du panier
    if (JSON.stringify(lines.value) === JSON.stringify(cart.lines)) cart.clear()
    sentRef.value = data.ref
  } catch (e) {
    sendError.value = e instanceof TypeError ? 'Connexion impossible. Vérifiez votre réseau et réessayez.' : e.message
  } finally {
    sending.value = false
  }
}
</script>
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.order" class="modal-back" @click.self="ui.closeOrder()" @keydown.esc="ui.closeOrder()">
        <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="order-title">

          <!-- Commande envoyée -->
          <div v-if="sentRef" class="text-center py-3" role="status">
            <i class="bi bi-check-circle-fill" style="font-size: 3.2rem; color: var(--ok)" aria-hidden="true"></i>
            <h2 id="order-title" class="h4 mt-2">Commande envoyée</h2>
            <p class="mb-1">Référence : <strong>{{ sentRef }}</strong></p>
            <p class="text-secondary">Le vendeur vous contactera au {{ clean.phone }} pour confirmer la disponibilité, le prix final et la livraison.</p>
            <button type="button" class="btn btn-ink" @click="ui.closeOrder()">Fermer</button>
          </div>

          <template v-else>
            <h2 id="order-title" class="h4"><i class="bi bi-bag-check"></i> Valider ma commande</h2>
            <p class="note-soft small">Votre commande est envoyée directement au vendeur, avec les photos des articles. Il vous contactera pour confirmer la disponibilité, le prix final et la livraison.</p>

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
              <p class="small text-secondary">Ces informations sont transmises au vendeur et mémorisées sur votre appareil pour vos prochaines commandes.</p>

              <details class="mb-3">
                <summary class="small fw-bold">Voir le récapitulatif</summary>
                <pre class="mt-2">{{ preview }}</pre>
              </details>

              <div v-if="sendError" class="alert-soft mb-3" role="alert">
                {{ sendError }}
                <div v-if="sendDetail" class="small mt-1">Détail technique : {{ sendDetail }}</div>
              </div>
            </template>

            <div class="d-flex gap-2 justify-content-end flex-wrap">
              <button ref="closeBtn" type="button" class="btn btn-line" @click="ui.closeOrder()">Retour au site</button>
              <button v-if="check.ok" type="button" class="btn btn-gold" :disabled="sending" @click="sendToShop">
                <span v-if="sending" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <i v-else class="bi bi-send"></i> {{ sending ? 'Envoi…' : 'Valider ma commande' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>