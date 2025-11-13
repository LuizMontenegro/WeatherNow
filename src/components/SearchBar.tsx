import { Loader2, MapPin, Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { LocationOption } from '../types/weather'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  suggestions: LocationOption[]
  loading?: boolean
  onSelect: (location: LocationOption) => void
}

const SearchBar = ({ value, onChange, suggestions, loading, onSelect }: SearchBarProps) => {
  const listId = useId()
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // Reset highlight quando sugestões mudarem
    setActiveIndex(suggestions.length ? 0 : -1)
  }, [suggestions.length])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      onSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setActiveIndex(-1)
    }
  }

  return (
    <div className="search-area">
      <div className="search-bar glass-card" role="combobox" aria-expanded={suggestions.length > 0} aria-controls={listId}>
        <Search size={18} className="icon-muted" />
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Busque por cidade ou região"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
          aria-label="Buscar localização"
        />
        {loading && <Loader2 size={18} className="spin icon-muted" />}
      </div>

      {suggestions.length > 0 && (
        <div id={listId} role="listbox" className="suggestions glass-card">
          {suggestions.map((option, idx) => (
            <button
              id={`${listId}-opt-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              key={`${option.latitude}-${option.longitude}`}
              onClick={() => onSelect(option)}
              className="suggestion-line"
              style={idx === activeIndex ? { background: 'rgba(255,255,255,0.12)' } : undefined}
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
}

export default SearchBar
