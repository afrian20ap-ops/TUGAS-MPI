import { useEffect, useRef, useState } from 'react'

/**
 * Interactive 3D perspective surface (GPU-only transform, prefers-reduced-motion safe).
 * Flattens smoothly while a child input/select/textarea has focus so typing feels rock-solid.
 */
export function Tilt3D({
  children,
  className = '',
  maxTilt = 5,
  restRotateX = 0,
  restRotateY = 0,
  glare = true,
}) {
  const ref = useRef(null)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [state, setState] = useState({
    rx: restRotateX,
    ry: restRotateY,
    gx: 50,
    gy: 20,
    active: false,
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const handleMove = (e) => {
    if (reduced || focused || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const ry = (px - 0.5) * (maxTilt * 2)
    const rx = (0.5 - py) * (maxTilt * 2)
    setState({
      rx: Number(rx.toFixed(2)),
      ry: Number(ry.toFixed(2)),
      gx: Math.round(px * 100),
      gy: Math.round(py * 100),
      active: true,
    })
  }

  const handleLeave = () => {
    setState({
      rx: restRotateX,
      ry: restRotateY,
      gx: 50,
      gy: 20,
      active: false,
    })
  }

  const transformValue = reduced
    ? 'none'
    : focused
      ? 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
      : `perspective(1100px) rotateX(${state.rx}deg) rotateY(${state.ry}deg) translateZ(${state.active ? 6 : 0}px)`

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
      className={`tilt-3d-wrap ${className}`}
      style={{
        transform: transformValue,
        '--glare-x': `${state.gx}%`,
        '--glare-y': `${state.gy}%`,
      }}
      data-active={state.active && !focused && !reduced ? 'true' : 'false'}
    >
      {children}
      {glare && !reduced && <span className="tilt-3d-glare" aria-hidden="true" />}
    </div>
  )
}

/**
 * Scroll-aware 3D settle entrance. Content stays visible by default (Hallmark Gate 62 safe).
 */
export function Reveal3D({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal-3d ${inView ? 'is-settled' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/**
 * GPU-accelerated progress bar using scaleX transform (never animates width).
 */
export function ProgressBar3D({ pct = 0, dark = false }) {
  const clamped = Math.max(0, Math.min(100, Number(pct) || 0))
  return (
    <div
      className={`h-2 w-full rounded-pill overflow-hidden ${dark ? 'bg-rail' : 'bg-paper-2'}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full w-full bg-accent rounded-pill progress-scale-fill"
        style={{ transform: `scaleX(${clamped / 100})` }}
      />
    </div>
  )
}
