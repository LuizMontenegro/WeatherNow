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

interface HourlyChartsProps {
  data: Array<{ time: string; temperature: number; humidity: number }>
}

const HourlyCharts = ({ data }: HourlyChartsProps) => {
  const chartData = data.map((d) => ({
    t: new Date(d.time),
    temperature: d.temperature,
    humidity: d.humidity,
  }))

  return (
    <div className="charts glass-card">
      <div>
        <p className="eyebrow">Hoje</p>
        <h3>Evolução de temperatura e umidade</h3>
      </div>
      <div style={{ width: '100%', height: 280 }}>
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
              labelFormatter={(v) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit' }).format(v as Date)}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              name="Temperatura (°C)"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              name="Umidade (%)"
              stroke="#60a5fa"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default HourlyCharts

