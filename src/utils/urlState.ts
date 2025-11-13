import type { AppSettings } from '../types/settings'
import type { LocationOption } from '../types/weather'

export const readLocationFromURL = (): LocationOption | null => {
  try {
    const sp = new URLSearchParams(window.location.search)
    const lat = sp.get('lat')
    const lon = sp.get('lon')
    if (!lat || !lon) return null
    const name = sp.get('name') ?? undefined
    const admin1 = sp.get('admin1') ?? undefined
    const country = sp.get('country') ?? undefined
    return {
      name: name ?? 'Local',
      admin1: admin1 || undefined,
      country: country || undefined,
      latitude: Number(lat),
      longitude: Number(lon),
    }
  } catch {
    return null
  }
}

export const writeURLState = (loc: LocationOption, settings?: AppSettings) => {
  try {
    const sp = new URLSearchParams(window.location.search)
    sp.set('lat', String(loc.latitude))
    sp.set('lon', String(loc.longitude))
    if (loc.name) sp.set('name', loc.name)
    if (loc.admin1) sp.set('admin1', loc.admin1)
    if (loc.country) sp.set('country', loc.country)
    if (settings) {
      sp.set('u', settings.temperatureUnit)
      sp.set('ws', settings.windSpeedUnit)
    }
    const next = `${window.location.pathname}?${sp.toString()}`
    window.history.replaceState({}, '', next)
  } catch {
    // noop
  }
}

export const readSettingsFromURL = (
  fallback: AppSettings,
): AppSettings => {
  try {
    const sp = new URLSearchParams(window.location.search)
    const u = sp.get('u')
    const ws = sp.get('ws')
    return {
      temperatureUnit: (u === 'fahrenheit' ? 'fahrenheit' : 'celsius'),
      windSpeedUnit: (ws === 'ms' || ws === 'mph' || ws === 'kn') ? (ws as any) : 'kmh',
    }
  } catch {
    return fallback
  }
}

