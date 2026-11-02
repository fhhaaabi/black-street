import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { load, save, onExternalChange } from '../services/storage.js'
import { getProductById } from '../data/products.js'
import { useUiStore } from './ui.js'

const readIds = () =>
  load('favorites', [], (v) => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string'))] : null))
    .filter((id) => getProductById(id)) // ignore les produits retirés du catalogue

export const useFavoritesStore = defineStore('favorites', () => {
  const ui = useUiStore()
  const ids = ref(readIds())
  const count = computed(() => ids.value.length)
  const has = (id) => ids.value.includes(id)

  function toggle(product) {
    if (has(product.id)) {
      ids.value = ids.value.filter((x) => x !== product.id)
      ui.notify('Retiré des favoris', 'info')
    } else {
      ids.value = [...ids.value, product.id]
      ui.notify('Ajouté aux favoris')
    }
  }
  const remove = (id) => { ids.value = ids.value.filter((x) => x !== id) }

  let warned = false
  watch(ids, (v) => {
    if (!save('favorites', v) && !warned) {
      warned = true
      ui.notify('Stockage local indisponible : vos favoris ne seront pas conservés.', 'warning', 5000)
    }
  }, { flush: 'sync' })
  onExternalChange('favorites', () => { ids.value = readIds() })

  return { ids, count, has, toggle, remove }
})
