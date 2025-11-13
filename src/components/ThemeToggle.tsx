import { Moon, Sun } from 'lucide-react'
import type { ThemeMode } from '../types/weather'

interface ThemeToggleProps {
  theme: ThemeMode
  onToggle: () => void
}

const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => (
  <button className="theme-toggle glass-card" onClick={onToggle} aria-label="Alternar tema claro/escuro">
    <div className="toggle-track">
      <span className={`thumb ${theme === 'dark' ? 'thumb-right' : ''}`} />
      <Sun size={16} />
      <Moon size={16} />
    </div>
    <span className="toggle-label">{theme === 'dark' ? 'Modo escuro' : 'Modo claro'}</span>
  </button>
)

export default ThemeToggle
