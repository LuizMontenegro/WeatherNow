import { Umbrella, Wind } from 'lucide-react'
import { getWeatherPresentation, formatDayName } from '../utils/weatherMeta'
import type { DailyForecast } from '../types/weather'
import type { AppSettings } from '../types/settings'
import { windSuffix, degreeSuffix } from '../utils/units'

interface ForecastListProps {
  items: DailyForecast[]
  loading?: boolean
  settings?: AppSettings
}

const ForecastList = ({ items, loading, settings }: ForecastListProps) => {
  if (loading) {
    return (
      <div className="card" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="text-body">Carregando previsão...</span>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex-col" style={{ gap: 'var(--space-lg)' }}>
        <div>
          <p className="text-xs" style={{ color: 'var(--color-accent)' }}>Próximos 7 dias</p>
          <h3 className="text-title">Previsão Estendida</h3>
        </div>

        {items.length === 0 ? (
          <p className="text-body">Sem dados disponíveis para este local.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-md)' }}>
            {items.map((day) => {
              const { Icon, label } = getWeatherPresentation(day.weatherCode, true)

              return (
                <div key={day.date} style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)'
                }}>
                  <div>
                    <strong className="text-sm" style={{ display: 'block' }}>{formatDayName(day.date)}</strong>
                    <span className="text-xs" style={{ opacity: 0.6 }}>{new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                  </div>

                  <div className="flex-row" style={{ gap: 'var(--space-xs)', padding: 'var(--space-sm) 0' }}>
                    <Icon size={24} style={{ color: 'var(--color-accent)' }} />
                    <span className="text-sm" style={{ lineHeight: 1.2 }}>{label}</span>
                  </div>

                  <div className="flex-row" style={{ justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div className="flex-col" style={{ gap: 0 }}>
                      <span className="text-xs">Máx</span>
                      <strong className="text-title" style={{ fontSize: '1.1rem' }}>
                        {Math.round(day.maxTemp)}{settings ? degreeSuffix(settings.temperatureUnit) : '°'}
                      </strong>
                    </div>
                    <div className="flex-col" style={{ gap: 0, opacity: 0.6 }}>
                      <span className="text-xs">Mín</span>
                      <strong className="text-body" style={{ fontSize: '1.1rem' }}>
                        {Math.round(day.minTemp)}{settings ? degreeSuffix(settings.temperatureUnit) : '°'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex-row" style={{ gap: 'var(--space-sm)', marginTop: 'var(--space-xs)', opacity: 0.7 }}>
                    {typeof day.precipitationProbability === 'number' && day.precipitationProbability > 0 && (
                      <div className="flex-row" style={{ gap: '4px' }}>
                        <Umbrella size={14} />
                        <span className="text-xs">{day.precipitationProbability}%</span>
                      </div>
                    )}
                    {typeof day.windSpeed === 'number' && (
                      <div className="flex-row" style={{ gap: '4px' }}>
                        <Wind size={14} />
                        <span className="text-xs">{Math.round(day.windSpeed)} {settings ? windSuffix(settings.windSpeedUnit) : 'km/h'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ForecastList
