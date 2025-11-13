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
      <div className="forecast glass-card skeleton">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton-forecast-row" />
        ))}
      </div>
    )
  }

  return (
    <div className="forecast glass-card">
      <div className="forecast-head">
        <div>
          <p className="eyebrow">Próximos 7 dias</p>
          <h3>Previsão estendida</h3>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Sem dados disponíveis para este local.</p>
      ) : (
        <div className="forecast-grid">
          {items.map((day) => {
            const { Icon, label } = getWeatherPresentation(day.weatherCode, true)

            return (
              <div key={day.date} className="forecast-card">
                <div className="forecast-day">
                  <strong>{formatDayName(day.date).toUpperCase()}</strong>
                  <span>{new Date(day.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="forecast-icon">
                  <Icon size={28} />
                  <span>{label}</span>
                </div>
              <div className="forecast-temps">
                <strong>
                  {Math.round(day.maxTemp)}{settings ? degreeSuffix(settings.temperatureUnit) : '°'}
                </strong>
                <span>
                  {Math.round(day.minTemp)}{settings ? degreeSuffix(settings.temperatureUnit) : '°'}
                </span>
              </div>
                <div className="forecast-meta">
                  {typeof day.precipitationProbability === 'number' && (
                    <span>
                      <Umbrella size={16} /> {day.precipitationProbability}%
                    </span>
                  )}
                {typeof day.windSpeed === 'number' && (
                  <span>
                    <Wind size={16} /> {Math.round(day.windSpeed)} {settings ? windSuffix(settings.windSpeedUnit) : 'km/h'}
                  </span>
                )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ForecastList
