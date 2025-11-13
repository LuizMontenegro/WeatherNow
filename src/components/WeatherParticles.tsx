import { useEffect, useRef } from 'react'

type ParticleMode = 'sun' | 'rain' | 'snow'

interface WeatherParticlesProps {
  mode: ParticleMode
  precipitationProb?: number | null
  windSpeed?: number | null
}

const WeatherParticles = ({ mode, precipitationProb, windSpeed }: WeatherParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      // Respeitar redução de movimento
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    const precipFactor = Math.min(Math.max((precipitationProb ?? 0) / 100, 0), 1)
    const windFactor = Math.min(Math.max((windSpeed ?? 0) / 40, 0), 1) // normaliza até ~40
    const baseCount = mode === 'sun' ? 50 : mode === 'rain' ? 120 : 100
    const count = Math.floor(
      baseCount * (mode === 'rain' ? (0.4 + 1.6 * precipFactor) : mode === 'snow' ? (0.6 + 0.8 * precipFactor) : (0.6 + 0.8 * windFactor))
    )

    const particles = Array.from({ length: count }).map(
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: mode === 'snow' ? Math.random() * 2 + 1 : Math.random() * 1.2 + 0.6,
        vy:
          mode === 'rain'
            ? (Math.random() * 2 + 2.0) * (0.6 + 1.2 * (precipFactor + windFactor) / 2)
            : Math.random() * 0.6 + 0.2,
        vx: mode === 'snow' ? (Math.random() - 0.5) * (0.2 + 0.6 * windFactor) : 0,
      }),
    )

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      if (mode === 'sun') {
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
      } else if (mode === 'rain') {
        ctx.fillStyle = 'rgba(147, 197, 253, 0.5)'
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
      }

      particles.forEach((p) => {
        p.y += p.vy
        p.x += p.vx
        if (p.y > height + 5) p.y = -5
        if (p.x > width + 5) p.x = -5
        if (p.x < -5) p.x = width + 5

        if (mode === 'rain') {
          ctx.beginPath()
          ctx.rect(p.x, p.y, 1.2, 6)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(() => onResize())
    observer.observe(canvas)
    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [mode, precipitationProb, windSpeed])

  return <canvas ref={canvasRef} className="particles-layer" />
}

export default WeatherParticles
