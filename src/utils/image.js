export const FALLBACK_IMAGE = '/img/placeholder.svg'

/** À brancher sur @error : remplace une image cassée par une image de secours (une seule fois). */
export function onImgError(event) {
  const img = event.target
  if (img.dataset.fallback) return
  img.dataset.fallback = '1'
  img.src = FALLBACK_IMAGE
}
