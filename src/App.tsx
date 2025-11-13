import { AlertTriangle } from 'lucide-react'
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import CurrentWeatherCard from './components/CurrentWeatherCard'
import ForecastList from './components/ForecastList'
import SearchBar from './components/SearchBar'
import ThemeToggle from './components/ThemeToggle'
import FavoritesBar from './components/FavoritesBar'
import WeatherParticles from './components/WeatherParticles'
import HourlyCharts from './components/HourlyCharts'
import CompareGrid from './components/CompareGrid'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import type { LocationOption, ThemeMode, WeatherData } from './types/weather'
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

  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(defaultLocation)
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
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    const controller = new AbortController()

    const fetchWeather = async () => {
      if (!selectedLocation) return
      setLoadingWeather(true)
      setError(null)

      try {
        const url = new URL('https://api.open-meteo.com/v1/forecast')
        url.searchParams.set('latitude', selectedLocation.latitude.toString())
        url.searchParams.set('longitude', selectedLocation.longitude.toString())
        url.searchParams.set(
          'current',
          'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
        )
        url.searchParams.set(
          'daily',
          'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
        )
        url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m')
        url.searchParams.set('forecast_days', '7')
        url.searchParams.set('timezone', 'auto')

        const response = await fetch(url, { signal: controller.signal })
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
          })),
          updatedAt: new Date().toISOString(),
        }

        setWeather(mapped)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error(err)
        setError('Algo saiu do previsto. Tente novamente em instantes.')
      } finally {
        setLoadingWeather(false)
      }
    }

    fetchWeather()

    return () => controller.abort()
  }, [selectedLocation])

  const gradient = useMemo(() => {
    if (weather?.current) {
      return getGradientStyles(weather.current.weatherCode, weather.current.isDay)
    }
    return getGradientStyles(2, true)
  }, [weather])

  const locationLabel = `${selectedLocation.name}${
    selectedLocation.country ? `, ${selectedLocation.country}` : ''
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
    } catch {}
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
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return (
    <div
      className={`app-shell ${theme}`}
      style={
        {
          backgroundImage: gradient.backgroundImage,
          backgroundColor: gradient.backgroundColor,
          '--glow-color': gradient.glow,
        } as CSSProperties
      }
    >
      <WeatherParticles
        mode={weather?.current ? (weather.current.weatherCode === 0 ? 'sun' : weather.current.weatherCode >= 71 ? 'snow' : weather.current.weatherCode >= 51 ? 'rain' : 'sun') : 'sun'}
      />
      <div className="overlay" />
      <main className="content">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Previsão personalizada</p>
            <h1>{locationLabel}</h1>
            {weather && <span className="timestamp">{formatUpdatedAt(weather.updatedAt)}</span>}
          </div>
          <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
        </header>

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

        {error && (
          <div className="error-banner glass-card">
            <AlertTriangle size={18} />
            <p>{error}</p>
          </div>
        )}

        <section className="dashboard-grid">
          <CurrentWeatherCard
            location={locationLabel}
            data={weather?.current}
            loading={loadingWeather}
            updatedAt={
              weather?.updatedAt
                ? new Intl.DateTimeFormat('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(weather.updatedAt))
                : undefined
            }
          />
          <ForecastList items={weather?.daily ?? []} loading={loadingWeather} />
        </section>

        {weather?.hourly && weather.hourly.length > 0 && <HourlyCharts data={weather.hourly} />}

        {compareMode && compareSelection.length > 0 && <CompareGrid selections={compareSelection} />}
      </main>
    </div>
  )
}

export default App
