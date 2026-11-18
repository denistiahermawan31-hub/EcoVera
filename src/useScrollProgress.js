import { useEffect } from 'react'

function useScrollProgress(ref, property = '--scroll') {
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.style.setProperty(property, '1')
      return undefined
    }

    let frameId = 0

    const update = () => {
      frameId = 0
      const rect = element.getBoundingClientRect()
      const viewport = window.innerHeight
      const progress = Math.min(
        1,
        Math.max(0, (viewport - rect.top) / (viewport + rect.height)),
      )
      element.style.setProperty(property, progress.toFixed(3))
    }

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [ref, property])
}

export default useScrollProgress
