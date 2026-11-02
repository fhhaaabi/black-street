import { shop } from '../config/shop.js'

export const sizeLabel = (p) => (p.sizeType === 'shoes' ? 'Pointure' : p.sizeType === 'clothing' ? 'Taille' : null)
export const getColor = (p, colorId) => p.colors.find((c) => c.id === colorId) || null
export const isSizeAvailable = (s) => s.available !== false && s.stock !== 0
export const cartKey = (productId, colorId, size) => `${productId}|${colorId || ''}|${size || ''}`

/** Stock connu pour une variante (nombre) ou null si non renseigné. */
export function variantStock(p, colorId, size) {
  const c = getColor(p, colorId)
  if (!c) return null
  if (c.sizes.length) {
    if (!size) return null
    const e = c.sizes.find((s) => s.label === size)
    return e && typeof e.stock === 'number' ? e.stock : null
  }
  if (typeof c.stock === 'number') return c.stock
  return typeof p.stock === 'number' ? p.stock : null
}

export function isColorAvailable(p, c) {
  if (c.available === false) return false
  if (c.sizes.length) return c.sizes.some(isSizeAvailable)
  const stock = typeof c.stock === 'number' ? c.stock : p.stock
  return stock !== 0
}

export function isVariantAvailable(p, colorId, size) {
  const c = getColor(p, colorId)
  if (!c || !isColorAvailable(p, c)) return false
  if (c.sizes.length) {
    const e = c.sizes.find((s) => s.label === size)
    return !!e && isSizeAvailable(e)
  }
  return true
}

export const isProductAvailable = (p) => p.colors.some((c) => isColorAvailable(p, c))

/** Prix (éventuellement propre à la couleur) + ancien prix uniquement si réduction réelle. */
export function priceInfo(p, colorId) {
  const c = getColor(p, colorId)
  const price = c?.price ?? p.price
  const old = c?.oldPrice ?? (c?.price != null ? null : p.oldPrice)
  const oldPrice = old && old > price ? old : null
  return { price, oldPrice, discount: oldPrice ? Math.round((1 - price / oldPrice) * 100) : null }
}

export const isOnSale = (p) => !!p.oldPrice && p.oldPrice > p.price
export const discountPercent = (p) => (isOnSale(p) ? Math.round((1 - p.price / p.oldPrice) * 100) : 0)

export function isNew(p) {
  if (!p.createdAt) return false
  const days = (Date.now() - new Date(p.createdAt).getTime()) / 86400000
  return days >= 0 && days <= shop.newDays
}
