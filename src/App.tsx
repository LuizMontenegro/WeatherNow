import { AlertTriangle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CurrentWeatherCard from './components/CurrentWeatherCard'
import ForecastList from './components/ForecastList'
import SearchBar from './components/SearchBar'
import ThemeToggle from './components/ThemeToggle'
import SettingsPanel from './components/SettingsPanel'
import FavoritesBar from './components/FavoritesBar'
import HourlyCharts from './components/HourlyCharts'
import CompareGrid from './components/CompareGrid'
import ShareLinkButton from './components/ShareLinkButton'
import Background from './components/Background'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import type { LocationOption, ThemeMode, WeatherData } from './types/weather'
import type { AppSettings } from './types/settings'
import { apiTemperatureUnit, apiWindSpeedUnit, loadSettings } from './utils/units'
import { readLocationFromURL, writeURLState, readSettingsFromURL } from './utils/urlState'
import { formatUpdatedAt, getGradientStyles } from './utils/weatherMeta'

const defaultLocation: LocationOption = {
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
}

const App = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme') as ThemeMode | null
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<LocationOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebouncedValue(searchTerm.trim(), 350)

  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(() => {
    if (typeof window === 'undefined') return defaultLocation
    return readLocationFromURL() ?? defaultLocation
  })
  const [favorites, setFavorites] = useState<LocationOption[]>(() => {
    try {
      const raw = localStorage.getItem('favorites')
      return raw ? (JSON.parse(raw) as LocationOption[]) : []
    } catch {
      return []
    }
  })
  const [compareMode, setCompareMode] = useState(false)
  const [compareSelection, setCompareSelection] = useState<LocationOption[]>([])
  const [settings, setSettings] = useState<AppSettings>(() => {
    const s = loadSettings()
    if (typeof window === 'undefined') return s
    return readSettingsFromURL(s)
  })
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    writeURLState(selectedLocation, settings)
  }, [selectedLocation, settings])

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()

    const fetchLocations = async () => {
      setIsSearching(true)
      try {
        const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
        url.searchParams.set('name', debouncedQuery)
        url.searchParams.set('count', '5')
        url.searchParams.set('language', 'pt')
        url.searchParams.set('format', 'json')

        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error('Erro ao buscar localizações')

        const payload = await response.json()
        setSuggestions(
          (payload.results ?? []).map(
            (item: any) =>
              ({
                id: item.id,
                name: item.name,
                country: item.country,
                admin1: item.admin1,
                latitude: item.latitude,
                longitude: item.longitude,
                timezone: item.timezone,
              }) satisfies LocationOption,
          ),
        )
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }

    fetchLocations()

    return () => controller.abort()
  }, [debouncedQuery])

  const fetchWeather = useCallback(async () => {
    try {
      if (!selectedLocation) return
      setLoadingWeather(true)
      setError(null)

      const url = new URL('https://api.open-meteo.com/v1/forecast')
      url.searchParams.set('latitude', selectedLocation.latitude.toString())
      url.searchParams.set('longitude', selectedLocation.longitude.toString())
      url.searchParams.set(
        'current',
        'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
      )
      url.searchParams.set(
        'daily',
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
      )
      url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m')
      url.searchParams.set('forecast_days', '7')
      url.searchParams.set('timezone', 'auto')
      url.searchParams.set('temperature_unit', apiTemperatureUnit(settings.temperatureUnit))
      url.searchParams.set('wind_speed_unit', apiWindSpeedUnit(settings.windSpeedUnit))

      const response = await fetch(url)
      if (!response.ok) throw new Error('Não conseguimos carregar o clima agora.')

      const payload = await response.json()

      const mapped: WeatherData = {
        current: {
          temperature: payload.current.temperature_2m,
          apparentTemperature: payload.current.apparent_temperature,
          humidity: payload.current.relative_humidity_2m,
          windSpeed: payload.current.wind_speed_10m,
          weatherCode: payload.current.weather_code,
          isDay: Boolean(payload.current.is_day),
        },
        daily: (payload.daily.time ?? []).map((time: string, index: number) => ({
          date: time,
          maxTemp: payload.daily.temperature_2m_max[index],
          minTemp: payload.daily.temperature_2m_min[index],
          weatherCode: payload.daily.weather_code[index],
          precipitationProbability: payload.daily.precipitation_probability_max?.[index],
          windSpeed: payload.daily.wind_speed_10m_max?.[index],
        })),
        hourly: (payload.hourly?.time ?? []).slice(0, 24).map((t: string, i: number) => ({
          time: t,
          temperature: payload.hourly.temperature_2m?.[i] ?? 0,
          humidity: payload.hourly.relative_humidity_2m?.[i] ?? 0,
          precipitationProbability: payload.hourly.precipitation_probability?.[i],
          windSpeed: payload.hourly.wind_speed_10m?.[i],
        })),
        sunrise: payload.daily?.sunrise?.[0],
        sunset: payload.daily?.sunset?.[0],
        updatedAt: new Date().toISOString(),
      }

      setWeather(mapped)
    } catch (err) {
      console.error(err)
      setError('Algo saiu do previsto. Tente novamente em instantes.')
    } finally {
      setLoadingWeather(false)
    }
  }, [selectedLocation, settings.temperatureUnit, settings.windSpeedUnit])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  const locationLabel = `${selectedLocation.name}${selectedLocation.country ? `, ${selectedLocation.country}` : ''
    }`

  const handleSelectLocation = (option: LocationOption) => {
    setSelectedLocation(option)
    setSearchTerm('')
    setSuggestions([])
  }

  const persistFavorites = (list: LocationOption[]) => {
    setFavorites(list)
    try {
      localStorage.setItem('favorites', JSON.stringify(list))
    } catch { }
  }

  const onAddOrRemoveCurrent = () => {
    if (!selectedLocation) return
    const exists = favorites.find(
      (f) => f.latitude === selectedLocation.latitude && f.longitude === selectedLocation.longitude,
    )
    if (exists) {
      persistFavorites(
        favorites.filter(
          (f) => !(f.latitude === selectedLocation.latitude && f.longitude === selectedLocation.longitude),
        ),
      )
    } else {
      persistFavorites([selectedLocation, ...favorites].slice(0, 12))
    }
  }

  const onRemoveFavorite = (fav: LocationOption) => {
    persistFavorites(favorites.filter((f) => !(f.latitude === fav.latitude && f.longitude === fav.longitude)))
  }

  const toggleCompareSelection = (fav: LocationOption) => {
    setCompareSelection((prev) => {
      const exists = prev.find((f) => f.latitude === fav.latitude && f.longitude === fav.longitude)
      if (exists) return prev.filter((f) => !(f.latitude === fav.latitude && f.longitude === fav.longitude))
      return [...prev, fav]
    })
  }

  const useGeolocation = useCallback(() => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse')
          url.searchParams.set('latitude', latitude.toString())
          url.searchParams.set('longitude', longitude.toString())
          url.searchParams.set('language', 'pt')
          url.searchParams.set('format', 'json')
          const res = await fetch(url)
          const payload = await res.json()
          const first = payload.results?.[0]
          const loc: LocationOption = {
            name: first?.name ?? 'Minha localização',
            admin1: first?.admin1,
            country: first?.country,
            latitude,
            longitude,
            timezone: first?.timezone,
          }
          setSelectedLocation(loc)
        } catch {
          setSelectedLocation({ name: 'Minha localização', latitude, longitude })
        }
      },
      () => { },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return (
    <div className={`app-shell ${theme}`} style={{ background: 'transparent' }}>
      <Background
        theme={theme}
        weatherCode={weather?.current?.weatherCode}
        isDay={weather?.current?.isDay}
      />
      <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
        <header className="flex-row" style={{ justifyContent: 'space-between', padding: 'var(--space-md) 0' }}>
          <div>
            <p className="text-xs">Previsão do Tempo</p>
            <h1 className="text-display">{selectedLocation.name}</h1>
            <p className="text-subtitle">
              {selectedLocation.country}
              {weather && <span className="text-sm" style={{ opacity: 0.6, marginLeft: '0.5rem' }}>• Atualizado {formatUpdatedAt(weather.updatedAt)}</span>}
            </p>
          </div>

          <div className="flex-row">
            <ThemeToggle theme={theme} onToggle={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))} />
            <SettingsPanel value={settings} onChange={setSettings} />
            <ShareLinkButton />
          </div>
        </header>

        <main className="content">
          <section className="flex-col" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              suggestions={suggestions}
              loading={isSearching}
              onSelect={handleSelectLocation}
            />

            <FavoritesBar
              favorites={favorites}
              current={selectedLocation}
              comparing={compareMode}
              compareSelection={compareSelection}
              onAddOrRemoveCurrent={onAddOrRemoveCurrent}
              onRemove={onRemoveFavorite}
              onSelect={handleSelectLocation}
              onToggleCompare={() => setCompareMode((v) => !v)}
              onToggleCompareItem={toggleCompareSelection}
              onUseGeolocation={useGeolocation}
            />
          </section>

          {error && (
            <div className="card" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              <div className="flex-row">
                <AlertTriangle size={20} />
                <p>{error}</p>
                <button className="btn btn-ghost" onClick={() => fetchWeather()} style={{ marginLeft: 'auto' }}>Tentar novamente</button>
              </div>
            </div>
          )}

          <div className="grid-dashboard">
            <div className="flex-col">
              <div className="animate-enter delay-100">
                <CurrentWeatherCard
                  location={locationLabel}
                  data={weather?.current}
                  loading={loadingWeather}
                  settings={settings}
                />
              </div>
              {weather?.hourly && (
                <div className="animate-enter delay-200">
                  <HourlyCharts data={weather.hourly} settings={settings} />
                </div>
              )}
            </div>

            <div className="flex-col animate-enter delay-300">
              <ForecastList items={weather?.daily ?? []} loading={loadingWeather} settings={settings} />
            </div>
          </div>

          {compareMode && compareSelection.length > 0 && (
            <section className="flex-col animate-enter delay-300">
              <h3 className="text-title">Comparativo</h3>
              <CompareGrid selections={compareSelection} />
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
