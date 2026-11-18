import { useEffect, useRef } from 'react'

const WING =
  'M0 0 C-4-13 -17-16 -18-6 C-19 2 -8 5 0 0 Z M0 1 C-4 11 -14 14 -15 6 C-16 0 -7-2 0 1 Z'

export default function ButterflyCursor({
  size = 40,
  flap = 9,
  ease = 0.07,
  wander = 14,
  color = '#FFFFFF',
}) {
  const elementRef = useRef(null)
  const leftWingRef = useRef(null)
  const rightWingRef = useRef(null)

  useEffect(() => {
    if (
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined
    }

    document.body.classList.add('butterfly-cursor-enabled')

    let mouseX = 0
    let mouseY = 0
    let x = 0
    let y = 0
    let rotation = 0
    let frameId = 0

    const handlePointerMove = (event) => {
      mouseX = event.clientX
      mouseY = event.clientY
    }

    const animate = (time) => {
      const wanderX = Math.sin(time / 900) * wander
      const wanderY = Math.cos(time / 1150) * wander * 0.7
      const deltaX = mouseX + wanderX - x
      const deltaY = mouseY + wanderY - y
      x += deltaX * ease
      y += deltaY * ease
      rotation += (Math.max(-34, Math.min(deltaX * 1.4, 34)) - rotation) * 0.1

      const open = Math.abs(Math.sin((time / 1000) * flap))
      leftWingRef.current?.setAttribute('transform', `scale(${-0.25 - open * 0.75} 1)`)
      rightWingRef.current?.setAttribute('transform', `scale(${0.25 + open * 0.75} 1)`)
      if (elementRef.current) {
        elementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`
      }

      frameId = window.requestAnimationFrame(animate)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.cancelAnimationFrame(frameId)
      document.body.classList.remove('butterfly-cursor-enabled')
    }
  }, [ease, flap, wander])

  return (
    <div
      ref={elementRef}
      className="fly"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        margin: `${-size / 2}px 0 0 ${-size / 2}px`,
      }}
    >
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <g transform="translate(20 20)">
          <g ref={leftWingRef} className="wing">
            <path d={WING} fill={color} />
          </g>
          <g ref={rightWingRef} className="wing">
            <path d={WING} fill={color} />
          </g>
          <rect x="-.9" y="-8" width="1.8" height="17" rx=".9" fill={color} />
        </g>
      </svg>
    </div>
  )
}
