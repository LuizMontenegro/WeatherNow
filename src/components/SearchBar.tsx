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
  const [focused, setFocused] = useState(false)

  useEffect(() => {
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
      inputRef.current?.blur()
    }
  }

  return (
    <div style={{ position: 'relative', zIndex: 50 }}>
      <div
        className="flex-row"
        style={{
          background: 'var(--color-surface)',
          border: `1px solid ${focused ? 'var(--color-accent)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-full)',
          padding: '0.8rem 1.2rem',
          transition: 'var(--transition-fast)',
          boxShadow: focused ? 'var(--shadow-glow)' : 'var(--shadow-sm)'
        }}
      >
        <Search size={20} style={{ color: focused ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }} />
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Busque por cidade ou região..."
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-primary)',
            fontSize: '1rem'
          }}
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        {loading && <Loader2 size={20} className="spin" style={{ color: 'var(--color-accent)' }} />}
      </div>

      {suggestions.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="card animate-enter"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            padding: '0.5rem',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((option, idx) => (
            <button
              id={`${listId}-opt-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              key={`${option.latitude}-${option.longitude}`}
              onClick={() => onSelect(option)}
              className="flex-row"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: idx === activeIndex ? 'var(--color-surface-highlight)' : 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 0.1s'
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <MapPin size={18} style={{ color: idx === activeIndex ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }} />
              <div>
                <p className="text-sm" style={{ fontWeight: 500, color: idx === activeIndex ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{option.name}</p>
                <span className="text-xs" style={{ opacity: 0.7 }}>
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
