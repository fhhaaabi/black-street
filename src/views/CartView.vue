<script setup>
import { ref } from 'vue'
import { shop } from '../config/shop.js'
import { useCartStore } from '../stores/cart.js'
import { useUiStore } from '../stores/ui.js'
import { formatPrice } from '../utils/currency.js'
import CartItem from '../components/CartItem.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import EmptyState from '../components/EmptyState.vue'
import PageHero from '../components/PageHero.vue'

const cart = useCartStore(), ui = useUiStore()
const confirmClear = ref(false)
const errors = ref([])

function checkout() {
  const v = cart.validateForOrder()
  errors.value = v.errors
  if (!v.ok) return
  ui.openOrder(cart.lines)
}
function clearAll() { cart.clear(); confirmClear.value = false; errors.value = []; ui.notify('Panier vidé', 'info') }
</script>
<template>
  <div>
  <PageHero compact title="Mon panier" a1="#ff5a1f" a2="#ffb020"
    :text="cart.items.length ? `${cart.count} article${cart.count > 1 ? 's' : ''}` : 'Préparez votre commande'" />
  <div class="container py-4 py-lg-5">

    <EmptyState v-if="!cart.items.length" icon="bi-bag" title="Votre panier est vide" text="Ajoutez des articles pour préparer votre commande.">
      <RouterLink to="/boutique" class="btn btn-ink">Découvrir la boutique</RouterLink>
    </EmptyState>

    <div v-else class="row g-4">
      <div class="col-lg-8">
        <div v-if="cart.priceAlerts.length" class="note-soft mb-3" role="alert">
          <strong>Des prix ont changé depuis votre ajout au panier.</strong>
          <div class="mt-2"><button type="button" class="btn btn-ink btn-sm" @click="cart.syncPrices()">Accepter les nouveaux prix</button></div>
        </div>
        <div class="d-grid gap-3">
          <CartItem v-for="i in cart.items" :key="i.key" :item="i" :alert="cart.alertFor(i.key)" @quantity="cart.setQuantity(i.key, $event)" @remove="cart.removeItem(i.key)" />
        </div>
        <div class="d-flex gap-2 flex-wrap mt-4">
          <RouterLink to="/boutique" class="btn btn-line">Continuer mes achats</RouterLink>
          <button type="button" class="btn btn-line" @click="confirmClear = true"><i class="bi bi-trash3"></i> Vider le panier</button>
        </div>
      </div>

      <div class="col-lg-4">
        <section class="summary" aria-labelledby="sum-title">
          <h2 id="sum-title" class="h4 mb-3">Récapitulatif</h2>
          <dl><dt>Articles</dt><dd>{{ cart.count }}</dd></dl>
          <dl><dt>Sous-total</dt><dd>{{ formatPrice(cart.subtotal) }}</dd></dl>
          <dl><dt>Livraison</dt><dd>{{ cart.deliveryFee == null ? 'À confirmer' : formatPrice(cart.deliveryFee) }}</dd></dl>
          <hr />
          <dl class="fs-5"><dt class="text-body">{{ cart.deliveryFee == null ? 'Total estimé hors livraison' : 'Total estimé' }}</dt><dd>{{ formatPrice(cart.total) }}</dd></dl>
          <p class="small text-secondary">{{ shop.delivery.note }} Le montant final est confirmé par le vendeur.</p>
          <div v-if="errors.length" class="alert-soft mb-3" role="alert"><ul class="mb-0"><li v-for="e in errors" :key="e">{{ e }}</li></ul></div>
          <button type="button" class="btn btn-gold w-100" @click="checkout"><i class="bi bi-whatsapp"></i> Valider ma commande</button>
        </section>
      </div>
    </div>

    <ConfirmDialog :open="confirmClear" title="Vider le panier ?" text="Tous les articles seront retirés de votre panier." confirm-label="Vider le panier" @confirm="clearAll" @cancel="confirmClear = false" />
  </div>
  </div>
</template>
