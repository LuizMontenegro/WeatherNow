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
  const [showHumidity, setShowHumidity] = useState(false)
  const [showPrecip, setShowPrecip] = useState(false)
  const [showWind, setShowWind] = useState(false)

  return (
    <div className="card">
      <div className="flex-col" style={{ gap: 'var(--space-lg)' }}>
        <div className="flex-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-accent)' }}>Hoje</p>
            <h3 className="text-title">Evolução Horária</h3>
          </div>

          <div className="flex-row" style={{ gap: 'var(--space-xs)' }}>
            <button className={`btn ${showTemp ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShowTemp((v) => !v)}>Temp</button>
            <button className={`btn ${showHumidity ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShowHumidity((v) => !v)}>Umidade</button>
            <button className={`btn ${showPrecip ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShowPrecip((v) => !v)}>Chuva</button>
            <button className={`btn ${showWind ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShowWind((v) => !v)}>Vento</button>
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="t"
                tickFormatter={(v) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit' }).format(v)}
                stroke="var(--color-text-tertiary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis yAxisId="left" orientation="left" stroke="var(--color-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)'
                }}
                itemStyle={{ fontSize: '0.9rem' }}
                labelStyle={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem' }}
                formatter={(value: any, name: string) => {
                  if (name.startsWith('Temperatura')) return [`${Math.round(value)}${settings ? degreeSuffix(settings.temperatureUnit) : '°C'}`, 'Temperatura']
                  if (name.startsWith('Umidade')) return [`${Math.round(value)}%`, 'Umidade']
                  if (name.startsWith('Chuva')) return [`${Math.round(value)}%`, 'Chuva']
                  if (name.startsWith('Vento')) return [`${Math.round(value)} ${settings?.windSpeedUnit ?? 'km/h'}`, 'Vento']
                  return [value, name]
                }}
                labelFormatter={(v) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(v as Date)}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {showTemp && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  name={`Temperatura`}
                  stroke="var(--color-warning)"
                  dot={false}
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />)}
              {showHumidity && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  name="Umidade"
                  stroke="var(--color-accent)"
                  dot={false}
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />)}
              {showPrecip && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="precipitation"
                  name="Chuva"
                  stroke="#a78bfa"
                  dot={false}
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />)}
              {showWind && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="wind"
                  name={`Vento`}
                  stroke="#2dd4bf"
                  dot={false}
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default HourlyCharts
