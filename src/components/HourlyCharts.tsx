import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'

import { useState } from 'react'
import type { AppSettings } from '../types/settings'
import { degreeSuffix } from '../utils/units'

interface HourlyChartsProps {
  data: Array<{
    time: string
    temperature: number
    humidity: number
    precipitationProbability?: number
    windSpeed?: number
  }>
  settings?: AppSettings
}

const HourlyCharts = ({ data, settings }: HourlyChartsProps) => {
  const chartData = data.map((d) => ({
    t: new Date(d.time),
    temperature: d.temperature,
    humidity: d.humidity,
    precipitation: d.precipitationProbability ?? null,
    wind: d.windSpeed ?? null,
  }))

  const [showTemp, setShowTemp] = useState(true)
  const [showHumidity, setShowHumidity] = useState(true)
  const [showPrecip, setShowPrecip] = useState(true)
  const [showWind, setShowWind] = useState(true)

  return (
    <div className="charts glass-card">
      <div>
        <p className="eyebrow">Hoje</p>
        <h3>Evolução de temperatura e umidade</h3>
      </div>
      <div style={{ width: '100%', height: 320 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button className={`fav-btn ${showTemp ? 'active' : ''}`} onClick={() => setShowTemp((v) => !v)}>Temp</button>
          <button className={`fav-btn ${showHumidity ? 'active' : ''}`} onClick={() => setShowHumidity((v) => !v)}>Umidade</button>
          <button className={`fav-btn ${showPrecip ? 'active' : ''}`} onClick={() => setShowPrecip((v) => !v)}>Chuva%</button>
          <button className={`fav-btn ${showWind ? 'active' : ''}`} onClick={() => setShowWind((v) => !v)}>Vento</button>
        </div>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              tickFormatter={(v) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit' }).format(v)}
              stroke="var(--text-muted)"
            />
            <YAxis yAxisId="left" orientation="left" stroke="var(--text-muted)" />
            <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name.startsWith('Temperatura')) return [`${Math.round(value)}${settings ? degreeSuffix(settings.temperatureUnit) : '°C'}`, 'Temperatura']
                if (name.startsWith('Umidade')) return [`${Math.round(value)}%`, 'Umidade']
                if (name.startsWith('Chuva')) return [`${Math.round(value)}%`, 'Chuva']
                if (name.startsWith('Vento')) return [`${Math.round(value)} ${settings?.windSpeedUnit ?? 'km/h'}`, 'Vento']
                return [value, name]
              }}
              labelFormatter={(v) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit' }).format(v as Date)}
            />
            <Legend />
            {showTemp && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              name={`Temperatura (${settings ? degreeSuffix(settings.temperatureUnit) : '°C'})`}
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />)}
            {showHumidity && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              name="Umidade (%)"
              stroke="#60a5fa"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />)}
            {showPrecip && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="precipitation"
              name="Chuva (%)"
              stroke="#a78bfa"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />)}
            {showWind && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wind"
              name={`Vento (${settings?.windSpeedUnit ?? 'km/h'})`}
              stroke="#2dd4bf"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default HourlyCharts
