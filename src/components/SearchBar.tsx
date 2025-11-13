import { Loader2, MapPin, Search } from 'lucide-react'
import type { LocationOption } from '../types/weather'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  suggestions: LocationOption[]
  loading?: boolean
  onSelect: (location: LocationOption) => void
}

const SearchBar = ({ value, onChange, suggestions, loading, onSelect }: SearchBarProps) => (
  <div className="search-area">
    <div className="search-bar glass-card">
      <Search size={18} className="icon-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Busque por cidade ou região"
        aria-label="Buscar localização"
      />
      {loading && <Loader2 size={18} className="spin icon-muted" />}
    </div>

    {suggestions.length > 0 && (
      <div className="suggestions glass-card">
        {suggestions.map((option) => (
          <button
            key={`${option.latitude}-${option.longitude}`}
            onClick={() => onSelect(option)}
            className="suggestion-line"
          >
            <MapPin size={18} />
            <div>
              <p>{option.name}</p>
              <span>
                {[option.admin1, option.country].filter(Boolean).join(', ')}
              </span>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
)

export default SearchBar
