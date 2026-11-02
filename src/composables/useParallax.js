import { onMounted, onBeforeUnmount } from 'vue'

/** Parallaxe du hero : défilement (tous appareils) + pointeur (ordinateur). Désactivée si "réduire les animations". */
export function useParallax(elRef) {
  let raf = 0, io, el
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const onScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(() => { raf = 0; el.style.setProperty('--sy', Math.min(window.scrollY, 900)) })
  }
  const onMove = (e) => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      el.style.setProperty('--mx', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3))
      el.style.setProperty('--my', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3))
    })
  }
  onMounted(() => {
    el = elRef.value
    if (!el || reduce()) return
    // On n'écoute que lorsque le hero est visible
    io = new IntersectionObserver(([entry]) => {
      const m = entry.isIntersecting ? 'addEventListener' : 'removeEventListener'
      window[m]('scroll', onScroll, { passive: true })
      if (fine()) window[m]('pointermove', onMove, { passive: true })
    })
    io.observe(el)
  })
  onBeforeUnmount(() => {
    io?.disconnect()
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('pointermove', onMove)
    cancelAnimationFrame(raf)
  })
}
