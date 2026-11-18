import { Fragment, useEffect, useRef } from 'react'

function ScrollText({ text, as: Tag = 'p', className = '', ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const words = Array.from(element.querySelectorAll('.st-word'))
    let frameId = 0

    const section = element.closest('section')

    const sectionOffset = (node) => {
      const parent = node.parentElement
      let top = parent ? parent.offsetTop : 0
      let sibling = node.previousElementSibling
      while (sibling) {
        top += sibling.offsetHeight
        sibling = sibling.previousElementSibling
      }
      return top
    }

    const offsetInSection = (node, container) => {
      let top = 0
      let current = node
      while (current && current !== container) {
        top += current.offsetTop
        current = current.offsetParent
      }
      return current === container ? top : node.offsetTop
    }

    let elementTop = 0
    let sectionTop = 0
    let isSticky = false

    const measure = () => {
      isSticky = section ? window.getComputedStyle(section).position === 'sticky' : false
      if (section) {
        sectionTop = sectionOffset(section)
        elementTop = sectionTop + offsetInSection(element, section)
      }
    }

    const update = () => {
      frameId = 0
      const viewport = window.innerHeight
      let progress

      if (isSticky) {
        const start = elementTop - viewport * 1.24
        const end = sectionTop + viewport * 0.12
        progress = (window.scrollY - start) / Math.max(1, end - start)
      } else {
        const rect = element.getBoundingClientRect()
        const start = viewport * 0.9
        const end = viewport * 0.25
        progress = (start - rect.top) / Math.max(1, start - end + rect.height)
      }

      progress = Math.min(1, Math.max(0, progress))
      const litCount = progress >= 1 ? words.length : Math.floor(progress * words.length)

      words.forEach((word, index) => {
        const isLit = index < litCount
        if (word.classList.contains('is-lit') !== isLit) {
          word.classList.toggle('is-lit', isLit)
        }
      })
    }

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update)
    }

    const handleResize = () => {
      measure()
      requestUpdate()
    }

    let active = true

    measure()
    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', handleResize)
    window.addEventListener('load', handleResize)
    document.fonts?.ready.then(() => {
      if (active) handleResize()
    })

    return () => {
      active = false
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('load', handleResize)
    }
  }, [text])

  const words = String(text).trim().split(/\s+/)

  return (
    <Tag ref={ref} className={`scroll-text${className ? ` ${className}` : ''}`} {...rest}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {index > 0 ? ' ' : ''}
          <span className="st-word">{word}</span>
        </Fragment>
      ))}
    </Tag>
  )
}

export default ScrollText
