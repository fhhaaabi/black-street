import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../services/storage.js'

export const useUiStore = defineStore('ui', () => {
  // Notifications discrètes
  const toasts = ref([])
  let nextId = 0
  function notify(message, type = 'success', duration = 3000) {
    const t = { id: ++nextId, message, type }
    toasts.value.push(t)
    setTimeout(() => dismiss(t.id), duration)
  }
  const dismiss = (id) => { toasts.value = toasts.value.filter((t) => t.id !== id) }

  // Fenêtre de commande WhatsApp : { lines } ou null
  const order = ref(null)
  const openOrder = (lines) => { order.value = { lines } }
  const closeOrder = () => { order.value = null }

  // Préférence d'interface : barre d'annonce masquée
  const prefs = load('prefs', {}, (v) => (v && typeof v === 'object' ? v : null))
  const announcementHidden = ref(prefs.announcementHidden === true)
  watch(announcementHidden, (v) => save('prefs', { announcementHidden: v }))

  return { toasts, notify, dismiss, order, openOrder, closeOrder, announcementHidden }
})
