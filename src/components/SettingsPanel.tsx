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
  <div className="flex-col" style={{ gap: 'var(--space-xs)' }}>
    <span className="text-xs">{label}</span>
    <div className="flex-row" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className="btn"
          style={{
            flex: 1,
            padding: '0.4rem',
            fontSize: '0.85rem',
            background: opt.value === value ? 'var(--color-surface-highlight)' : 'transparent',
            color: opt.value === value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
          }}
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
    <div className="settings-wrapper" style={{ position: 'relative' }}>
      <button className="btn btn-ghost" onClick={() => setOpen((v) => !v)}>
        <SettingsIcon size={16} />
        <span className="text-sm">Unidades</span>
      </button>

      {open && (
        <div className="card animate-enter" style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          right: 0,
          zIndex: 100,
          width: '280px',
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)'
        }}>
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

          <div className="text-xs" style={{ opacity: 0.6, textAlign: 'center' }}>
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

