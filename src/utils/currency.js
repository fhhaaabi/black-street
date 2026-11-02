import { shop } from '../config/shop.js'

const nf = new Intl.NumberFormat(shop.currency.locale)

/** 8000 → "8 000 FCFA" (espaces normaux, pour WhatsApp comme pour l'affichage) */
export function formatPrice(value) {
  const n = Number(value)
  const safe = Number.isFinite(n) ? n : 0
  return `${nf.format(safe).replace(/[\u202f\u00a0]/g, ' ')} ${shop.currency.code}`
}
