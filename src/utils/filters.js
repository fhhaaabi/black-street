import { categoryName } from '../data/categories.js'
import { isColorAvailable, isSizeAvailable } from './product.js'

/** Minuscules + sans accents, pour une recherche tolérante. */
export const normalize = (s) =>
  String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export const defaultFilters = () => ({
  q: '', category: '', minPrice: null, maxPrice: null, size: '', color: '', inStock: false, sort: 'relevance'
})

export function filterProducts(list, f) {
  const terms = normalize(f.q).split(/\s+/).filter(Boolean)
  return list.filter((p) => {
    if (terms.length) {
      const hay = normalize([p.name, categoryName(p.category), ...p.tags, ...p.colors.map((c) => c.name)].join(' '))
      if (!terms.every((t) => hay.includes(t))) return false
    }
    if (f.category && p.category !== f.category) return false
    if (f.minPrice != null && p.price < f.minPrice) return false
    if (f.maxPrice != null && p.price > f.maxPrice) return false
    const colors = f.color ? p.colors.filter((c) => c.id === f.color) : p.colors
    if (!colors.length) return false
    if (f.size && !colors.some((c) => c.sizes.some((s) => s.label === f.size && isSizeAvailable(s)))) return false
    if (f.inStock && !colors.some((c) => isColorAvailable(p, c))) return false
    return true
  })
}

export function sortProducts(list, sort) {
  const l = [...list]
  if (sort === 'price-asc') l.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') l.sort((a, b) => b.price - a.price)
  else if (sort === 'newest') l.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  else if (sort === 'popular') l.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
  return l
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
export function compareSizes(a, b) {
  const na = Number(a), nb = Number(b)
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
  return SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)
}
