import { useEffect, useRef } from 'react'

type ParticleMode = 'sun' | 'rain' | 'snow'

interface WeatherParticlesProps {
  mode: ParticleMode
}

const WeatherParticles = ({ mode }: WeatherParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    const particles = Array.from({ length: mode === 'sun' ? 60 : mode === 'rain' ? 120 : 100 }).map(
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: mode === 'snow' ? Math.random() * 2 + 1 : Math.random() * 1.2 + 0.6,
        vy: mode === 'rain' ? Math.random() * 2 + 2.5 : Math.random() * 0.6 + 0.2,
        vx: mode === 'snow' ? (Math.random() - 0.5) * 0.4 : 0,
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
  }, [mode])

  return <canvas ref={canvasRef} className="particles-layer" />
}

export default WeatherParticles
