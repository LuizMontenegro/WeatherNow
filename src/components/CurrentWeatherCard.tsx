import type { ReactNode } from 'react'
import { Droplets, Gauge, Wind } from 'lucide-react'
import { getWeatherPresentation } from '../utils/weatherMeta'
import type { CurrentWeather } from '../types/weather'
import type { AppSettings } from '../types/settings'
import { degreeSuffix, windSuffix } from '../utils/units'

interface CurrentWeatherCardProps {
  location: string
  data?: CurrentWeather
  loading?: boolean
  updatedAt?: string
  settings?: AppSettings
}

const Metric = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex-row" style={{ gap: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
    <div style={{ color: 'var(--color-accent)' }}>{icon}</div>
    <div>
      <span className="text-xs" style={{ display: 'block', marginBottom: '2px' }}>{label}</span>
      <strong className="text-sm">{value}</strong>
    </div>
  </div>
)

const CurrentWeatherCard = ({ location, data, loading, settings }: CurrentWeatherCardProps) => {
  if (loading || !data) {
    return (
      <div className="card" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="text-body">Carregando...</span>
      </div>
    )
  }

  const { Icon, label } = getWeatherPresentation(data.weatherCode, data.isDay)

  return (
    <div className="card">
      <div className="flex-col" style={{ gap: 'var(--space-xl)' }}>
        <header className="flex-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-accent)' }}>Agora</p>
            <h2 className="text-title">{location}</h2>
          </div>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--color-surface-highlight)',
            borderRadius: 'var(--radius-full)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--color-accent)'
          }}>
            <Icon size={32} />
          </div>
        </header>

        <div className="flex-row" style={{ alignItems: 'flex-end', gap: 'var(--space-lg)' }}>
          <span className="text-display" style={{ lineHeight: 1 }}>
            {Math.round(data.temperature)}{settings ? degreeSuffix(settings.temperatureUnit) : '°'}
          </span>
          <div style={{ paddingBottom: '0.5rem' }}>
            <p className="text-title" style={{ fontWeight: 500 }}>{label}</p>
            <span className="text-body">
              Sensação {Math.round(data.apparentTemperature)}{settings ? degreeSuffix(settings.temperatureUnit) : '°'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-md)' }}>
          <Metric icon={<Droplets size={18} />} label="Umidade" value={`${Math.round(data.humidity)}%`} />
          <Metric
            icon={<Wind size={18} />}
            label="Vento"
            value={`${Math.round(data.windSpeed)} ${settings ? windSuffix(settings.windSpeedUnit) : 'km/h'}`}
          />
          <Metric icon={<Gauge size={18} />} label="Código WMO" value={`${data.weatherCode}`} />
        </div>
      </div>
    </div>
  )
}

export default CurrentWeatherCard
