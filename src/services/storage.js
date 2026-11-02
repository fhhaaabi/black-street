// Service unique d'accès au LocalStorage : versionné, validé, tolérant aux erreurs.
// Ne jamais y stocker de mot de passe ni de donnée bancaire.
const PREFIX = 'maison-aurore:'
const VERSION = 1

const hasStorage = () => {
  try { return typeof localStorage !== 'undefined' } catch { return false }
}

/** Lit une donnée. `validate` renvoie la donnée nettoyée, ou null si invalide. */
export function load(key, fallback, validate) {
  if (!hasStorage()) return fallback
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.v !== VERSION) return fallback // format inconnu → valeurs par défaut
    const data = validate ? validate(parsed.data) : parsed.data
    return data ?? fallback
  } catch {
    return fallback // JSON corrompu ou accès refusé
  }
}

/** Écrit une donnée. Renvoie false si le stockage est indisponible ou plein. */
export function save(key, data) {
  if (!hasStorage()) return false
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ v: VERSION, data }))
    return true
  } catch {
    return false
  }
}

/** Appelle `cb` quand un autre onglet modifie la clé (synchronisation entre onglets). */
export function onExternalChange(key, cb) {
  if (typeof window === 'undefined') return
  window.addEventListener('storage', (e) => {
    if (e.key === PREFIX + key) cb()
  })
}
