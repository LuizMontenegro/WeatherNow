import { useEffect, useState } from 'react'
import type { ThemeMode } from '../types/weather'

interface BackgroundProps {
    theme: ThemeMode
    weatherCode?: number
    isDay?: boolean
}

const Background = ({ theme, weatherCode, isDay = true }: BackgroundProps) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Determina a paleta de cores baseada no clima e tema
    const getPalette = () => {
        const isDark = theme === 'dark'

        // Default / Clear
        let colors = isDark
            ? ['#020617', '#0f172a', '#1e293b', '#0369a1'] // Deep Slate & Muted Blue
            : ['#e2e8f0', '#cbd5e1', '#94a3b8', '#38bdf8']

        if (weatherCode !== undefined) {
            // Chuva / Tempestade
            if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 99)) {
                colors = isDark
                    ? ['#020617', '#1e1b4b', '#312e81', '#3730a3'] // Deep Indigo
                    : ['#cbd5e1', '#c7d2fe', '#a5b4fc', '#818cf8']
            }
            // Sol / Limpo
            else if (weatherCode <= 3 && isDay) {
                colors = isDark
                    ? ['#020617', '#082f49', '#0c4a6e', '#0284c7'] // Deep Sky (Less Neon)
                    : ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8']
            }
            // Nublado
            else if (weatherCode > 3 && weatherCode < 51) {
                colors = isDark
                    ? ['#020617', '#1e293b', '#334155', '#475569'] // Monochrome Slate
                    : ['#e2e8f0', '#94a3b8', '#64748b', '#475569']
            }
        }
        return colors
    }

    const palette = getPalette()

    // Weather Effects
    const isRaining = weatherCode !== undefined && ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 99))
    const isCloudy = weatherCode !== undefined && (weatherCode > 3)
    const isSunny = weatherCode !== undefined && weatherCode <= 3 && isDay

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ background: palette[0], transition: 'background 1s ease' }}>
            {/* Base Gradients */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <div
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[80px] animate-blob"
                    style={{ background: palette[1], opacity: 0.6 }}
                />
                <div
                    className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"
                    style={{ background: palette[2], opacity: 0.5 }}
                />
                <div
                    className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[90px] animate-blob animation-delay-4000"
                    style={{ background: palette[3], opacity: 0.4 }}
                />
            </div>

            {/* Weather Specific Layers */}

            {/* Sun Glow */}
            {isSunny && (
                <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse-slow"
                    style={{ background: 'radial-gradient(circle, rgba(253,224,71,0.8) 0%, rgba(253,224,71,0) 70%)' }} />
            )}

            {/* Clouds Overlay */}
            {isCloudy && (
                <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                    <div className="absolute top-[10%] left-[-10%] w-[60vw] h-[40vw] bg-white rounded-full filter blur-[100px] animate-float-slow" />
                    <div className="absolute top-[40%] right-[-20%] w-[70vw] h-[50vw] bg-white rounded-full filter blur-[120px] animate-float-slower" />
                </div>
            )}

            {/* Rain Effect (CSS) */}
            {isRaining && (
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Crect x='10' y='0' width='1' height='5'/%3E%3C/g%3E%3C/svg%3E")`, animation: 'rain 0.8s linear infinite' }} />
            )}
        </div>
    )
}

export default Background
