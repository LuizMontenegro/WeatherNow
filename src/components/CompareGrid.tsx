import { useEffect, useState } from 'react'
import type { LocationOption, WeatherData } from '../types/weather'
import CurrentWeatherCard from './CurrentWeatherCard'

interface CompareGridProps {
  selections: LocationOption[]
}

const fetchFor = async (loc: LocationOption, signal: AbortSignal): Promise<WeatherData> => {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', loc.latitude.toString())
  url.searchParams.set('longitude', loc.longitude.toString())
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
  )
  url.searchParams.set('timezone', 'auto')
  const res = await fetch(url, { signal })
  const payload = await res.json()
  return {
    current: {
      temperature: payload.current.temperature_2m,
      apparentTemperature: payload.current.apparent_temperature,
      humidity: payload.current.relative_humidity_2m,
      windSpeed: payload.current.wind_speed_10m,
      weatherCode: payload.current.weather_code,
      isDay: Boolean(payload.current.is_day),
    },
    daily: [],
    updatedAt: new Date().toISOString(),
  }
}

const CompareGrid = ({ selections }: CompareGridProps) => {
  const [items, setItems] = useState<Array<{ loc: LocationOption; data?: WeatherData }>>(
    selections.map((loc) => ({ loc })),
  )

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      const results = await Promise.all(
        selections.map(async (loc) => ({ loc, data: await fetchFor(loc, controller.signal) })),
      )
      setItems(results)
    }
    run()
    return () => controller.abort()
  }, [selections])

  if (!selections.length) return null

  return (
    <div className="compare-grid">
      {items.map(({ loc, data }) => (
        <CurrentWeatherCard
          key={`${loc.latitude}-${loc.longitude}`}
          location={`${loc.name}${loc.country ? `, ${loc.country}` : ''}`}
          data={data?.current}
          loading={!data}
          updatedAt={data?.updatedAt}
        />
      ))}
    </div>
  )
}

export default CompareGrid

