import { useEffect } from 'react'

/**
 * Scroll-driven horizontal reel.
 * The section grows tall enough to hold the horizontal distance, the inner
 * viewport stays pinned, and the track is translated with scroll progress.
 * Falls back to a normal stacked layout on small screens / reduced motion.
 */
export default function useHorizontalReel(sectionRef, trackRef) {
  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compact = window.matchMedia('(max-width: 900px)')
    let frameId = 0
    let distance = 0
    let disposed = false

    const update = () => {
      frameId = 0
      if (disposed || reduce.matches || compact.matches) return
      const scrollable = section.offsetHeight - window.innerHeight
      if (scrollable <= 0) return

      const rect = section.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable))
      track.style.transform = `translate3d(${-distance * progress}px, 0, 0)`
      section.style.setProperty('--reel-progress', progress.toFixed(3))
    }

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update)
    }

    const layout = () => {
      if (disposed) return
      distance = Math.max(0, track.scrollWidth - window.innerWidth)

      if (reduce.matches || compact.matches) {
        section.style.removeProperty('height')
        section.style.removeProperty('--reel-progress')
        track.style.removeProperty('transform')
        return
      }

      section.style.height = `${Math.round(window.innerHeight + distance)}px`
      update()
    }

    layout()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', layout)
    window.addEventListener('load', layout)
    reduce.addEventListener?.('change', layout)
    compact.addEventListener?.('change', layout)

    document.fonts?.ready.then(layout)

    // Images change the track width once decoded, so re-measure on load.
    track.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', layout, { once: true })
    })

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', layout)
      window.removeEventListener('load', layout)
      reduce.removeEventListener?.('change', layout)
      compact.removeEventListener?.('change', layout)
    }
  }, [sectionRef, trackRef])
}
