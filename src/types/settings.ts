export type TemperatureUnit = 'celsius' | 'fahrenheit'
export type WindSpeedUnit = 'kmh' | 'ms' | 'mph' | 'kn'

export interface AppSettings {
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
}

export const defaultSettings: AppSettings = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
}

