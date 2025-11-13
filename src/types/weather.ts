export type ThemeMode = 'light' | 'dark'

export interface LocationOption {
  id?: number
  name: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
  timezone?: string
}

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  isDay: boolean
}

export interface DailyForecast {
  date: string
  maxTemp: number
  minTemp: number
  weatherCode: number
  precipitationProbability?: number
  windSpeed?: number
}

export interface WeatherData {
  current: CurrentWeather
  daily: DailyForecast[]
  updatedAt: string
  hourly?: Array<{ time: string; temperature: number; humidity: number }>
}
