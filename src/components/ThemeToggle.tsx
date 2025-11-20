import { Moon, Sun } from 'lucide-react'
import type { ThemeMode } from '../types/weather'

interface ThemeToggleProps {
  theme: ThemeMode
  onToggle: () => void
}

const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => (
  <button className="btn btn-ghost" onClick={onToggle} aria-label="Alternar tema claro/escuro">
    <div className="flex-row" style={{ gap: '0.5rem' }}>
      {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
      <span className="text-sm">{theme === 'dark' ? 'Modo escuro' : 'Modo claro'}</span>
    </div>
  </button>
)

export default ThemeToggle
