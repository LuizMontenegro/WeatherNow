import type { ReactNode } from 'react'
import { Droplets, Gauge, ThermometerSun, Wind } from 'lucide-react'
import { getWeatherPresentation } from '../utils/weatherMeta'
import type { CurrentWeather } from '../types/weather'

interface CurrentWeatherCardProps {
  location: string
  data?: CurrentWeather
  loading?: boolean
  updatedAt?: string
}

const Metric = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="metric">
    <div className="metric-icon">{icon}</div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
)

const CurrentWeatherCard = ({ location, data, loading, updatedAt }: CurrentWeatherCardProps) => {
  if (loading || !data) {
    return (
      <div className="current-card glass-card skeleton">
        <div className="skeleton-row" />
        <div className="skeleton-temp" />
        <div className="skeleton-metrics">
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  }

  const { Icon, label } = getWeatherPresentation(data.weatherCode, data.isDay)

  return (
    <div className="current-card glass-card">
      <header>
        <div>
          <p className="eyebrow">Agora</p>
          <h2>{location}</h2>
          {updatedAt && <span className="timestamp">Atualizado {updatedAt}</span>}
        </div>
        <div className="condition-icon">
          <Icon size={48} />
        </div>
      </header>
      <div className="temperature-display">
        <span className="temperature-value">{Math.round(data.temperature)}°</span>
        <div>
          <p className="condition">{label}</p>
          <span>Sensação {Math.round(data.apparentTemperature)}°</span>
        </div>
      </div>
      <div className="metrics-grid">
        <Metric icon={<ThermometerSun size={18} />} label="Sensação" value={`${Math.round(data.apparentTemperature)}°`} />
        <Metric icon={<Droplets size={18} />} label="Umidade" value={`${Math.round(data.humidity)}%`} />
        <Metric icon={<Wind size={18} />} label="Vento" value={`${Math.round(data.windSpeed)} km/h`} />
        <Metric icon={<Gauge size={18} />} label="Código" value={`WMO ${data.weatherCode}`} />
      </div>
    </div>
  )
}

export default CurrentWeatherCard
