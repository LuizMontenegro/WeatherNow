import { Settings as SettingsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AppSettings, TemperatureUnit, WindSpeedUnit } from '../types/settings'
import { loadSettings, saveSettings, degreeSuffix, windSuffix } from '../utils/units'

interface SettingsPanelProps {
  value?: AppSettings
  onChange: (next: AppSettings) => void
}

const Segment = <T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ label: string; value: T }>
  value: T
  onChange: (v: T) => void
}) => (
  <div className="segment">
    <span className="segment-label">{label}</span>
    <div className="segment-track glass-card">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`segment-item ${opt.value === value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
)

const SettingsPanel = ({ value, onChange }: SettingsPanelProps) => {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(value ?? loadSettings())

  useEffect(() => {
    onChange(settings)
    saveSettings(settings)
  }, [settings])

  return (
    <div className="settings-wrapper">
      <button className="theme-toggle glass-card" onClick={() => setOpen((v) => !v)}>
        <SettingsIcon size={16} />
        <span className="toggle-label">Unidades</span>
      </button>

      {open && (
        <div className="settings-panel glass-card">
          <Segment<TemperatureUnit>
            label="Temperatura"
            value={settings.temperatureUnit}
            onChange={(temperatureUnit) => setSettings((s) => ({ ...s, temperatureUnit }))}
            options={[
              { label: '°C', value: 'celsius' },
              { label: '°F', value: 'fahrenheit' },
            ]}
          />
          <Segment<WindSpeedUnit>
            label="Vento"
            value={settings.windSpeedUnit}
            onChange={(windSpeedUnit) => setSettings((s) => ({ ...s, windSpeedUnit }))}
            options={[
              { label: 'km/h', value: 'kmh' },
              { label: 'm/s', value: 'ms' },
              { label: 'mph', value: 'mph' },
              { label: 'kn', value: 'kn' },
            ]}
          />

          <div className="settings-summary">
            <span>
              Exibindo: {degreeSuffix(settings.temperatureUnit)} e {windSuffix(settings.windSpeedUnit)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPanel

