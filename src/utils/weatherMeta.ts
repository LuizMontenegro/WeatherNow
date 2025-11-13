import type { LucideIcon } from 'lucide-react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from 'lucide-react'

export type GradientKey =
  | 'clear-day'
  | 'clear-night'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog'

interface GradientToken {
  backgroundImage: string
  backgroundColor: string
  glow: string
}

const gradientTokens: Record<GradientKey, GradientToken> = {
  'clear-day': {
    backgroundImage: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 65%, #1C4480 100%)',
    backgroundColor: '#1C4480',
    glow: 'rgba(255, 255, 255, 0.35)',
  },
  'clear-night': {
    backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
    backgroundColor: '#0F172A',
    glow: 'rgba(120, 131, 255, 0.3)',
  },
  cloudy: {
    backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1E3A8A 60%, #0F172A 100%)',
    backgroundColor: '#1E3A8A',
    glow: 'rgba(209, 213, 219, 0.25)',
  },
  rain: {
    backgroundImage: 'linear-gradient(135deg, #1F2937 0%, #111827 55%, #0B1120 100%)',
    backgroundColor: '#0B1120',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  storm: {
    backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #1F2937 50%, #000000 100%)',
    backgroundColor: '#000000',
    glow: 'rgba(248, 250, 252, 0.35)',
  },
  snow: {
    backgroundImage: 'linear-gradient(135deg, #CBD5F5 0%, #94A3B8 50%, #475569 100%)',
    backgroundColor: '#94A3B8',
    glow: 'rgba(255, 255, 255, 0.45)',
  },
  fog: {
    backgroundImage: 'linear-gradient(135deg, #94A3B8 0%, #475569 55%, #1E293B 100%)',
    backgroundColor: '#475569',
    glow: 'rgba(226, 232, 240, 0.35)',
  },
}

const WEATHER_DESCRIPTIONS: Record<string, string> = {
  clear: 'Céu limpo',
  partly: 'Parcialmente nublado',
  cloudy: 'Nublado',
  fog: 'Neblina',
  rain: 'Chuva',
  storm: 'Tempestade',
  snow: 'Neve',
}

const weatherCodeToKey = (code: number): keyof typeof WEATHER_DESCRIPTIONS => {
  if (code === 0) return 'clear'
  if (code === 1) return 'partly'
  if (code === 2) return 'partly'
  if (code === 3) return 'cloudy'
  if ([45, 48].includes(code)) return 'fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'rain'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if ([95, 96, 99].includes(code)) return 'storm'
  return 'cloudy'
}

const iconMap: Record<string, LucideIcon> = {
  clearDay: Sun,
  clearNight: Moon,
  partlyDay: CloudSun,
  partlyNight: CloudMoon,
  cloudy: Cloud,
  rain: CloudRain,
  drizzle: CloudDrizzle,
  storm: CloudLightning,
  snow: CloudSnow,
  fog: CloudFog,
}

export const getWeatherDescription = (code: number) =>
  WEATHER_DESCRIPTIONS[weatherCodeToKey(code)] ?? 'Condição variada'

const resolveGradientKey = (code: number, isDay: boolean): GradientKey => {
  const key = weatherCodeToKey(code)

  if (key === 'clear') {
    return isDay ? 'clear-day' : 'clear-night'
  }

  if (key === 'partly') {
    return isDay ? 'clear-day' : 'clear-night'
  }

  if (key === 'fog') return 'fog'
  if (key === 'rain') return 'rain'
  if (key === 'storm') return 'storm'
  if (key === 'snow') return 'snow'
  return 'cloudy'
}

export const getGradientStyles = (code: number, isDay: boolean) => gradientTokens[resolveGradientKey(code, isDay)]

export const getWeatherPresentation = (
  code: number,
  isDay: boolean,
): { label: string; Icon: LucideIcon } => {
  const key = weatherCodeToKey(code)
  const label = WEATHER_DESCRIPTIONS[key]

  if (key === 'clear') {
    return { label, Icon: isDay ? iconMap.clearDay : iconMap.clearNight }
  }

  if (key === 'partly') {
    return { label, Icon: isDay ? iconMap.partlyDay : iconMap.partlyNight }
  }

  if (key === 'rain') {
    const drizzleCodes = [51, 53, 55, 56, 57]
    if (drizzleCodes.includes(code)) {
      return { label: 'Garoa', Icon: iconMap.drizzle }
    }
    return { label, Icon: iconMap.rain }
  }

  return { label, Icon: iconMap[key] ?? iconMap.cloudy }
}

export const formatDayName = (date: string, locale = 'pt-BR') =>
  new Intl.DateTimeFormat(locale, { weekday: 'short' })
    .format(new Date(date))
    .replace('.', '')

export const formatUpdatedAt = (date: string, locale = 'pt-BR') =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
