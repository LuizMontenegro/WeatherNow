import type { AppSettings, TemperatureUnit, WindSpeedUnit } from '../types/settings'

export const apiTemperatureUnit = (u: TemperatureUnit) => (u === 'fahrenheit' ? 'fahrenheit' : 'celsius')
export const apiWindSpeedUnit = (u: WindSpeedUnit) => u // matches open-meteo values

export const degreeSuffix = (u: TemperatureUnit) => (u === 'fahrenheit' ? '°F' : '°C')
export const windSuffix = (u: WindSpeedUnit) => {
  switch (u) {
    case 'kmh':
      return 'km/h'
    case 'ms':
      return 'm/s'
    case 'mph':
      return 'mph'
    case 'kn':
      return 'kn'
  }
}

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem('settings')
    if (!raw) return { temperatureUnit: 'celsius', windSpeedUnit: 'kmh' }
    const parsed = JSON.parse(raw) as AppSettings
    return {
      temperatureUnit: parsed.temperatureUnit ?? 'celsius',
      windSpeedUnit: parsed.windSpeedUnit ?? 'kmh',
    }
  } catch {
    return { temperatureUnit: 'celsius', windSpeedUnit: 'kmh' }
  }
}

export const saveSettings = (s: AppSettings) => {
  try {
    localStorage.setItem('settings', JSON.stringify(s))
  } catch {}
}

