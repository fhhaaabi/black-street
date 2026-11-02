// v-reveal : apparition progressive à l'entrée dans l'écran (désactivée si "réduire les animations")
let observer
export const reveal = {
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value?.delay) el.style.transitionDelay = `${binding.value.delay}ms`
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return el.classList.add('in')
    observer ??= new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target) }
      })
    }, { threshold: 0.1 })
    observer.observe(el)
  }
}
