import { Crosshair, Shuffle, Star, StarOff, X } from 'lucide-react'
import type { LocationOption } from '../types/weather'

interface FavoritesBarProps {
  favorites: LocationOption[]
  current?: LocationOption
  comparing: boolean
  compareSelection: LocationOption[]
  onAddOrRemoveCurrent: () => void
  onRemove: (fav: LocationOption) => void
  onSelect: (fav: LocationOption) => void
  onToggleCompare: () => void
  onToggleCompareItem: (fav: LocationOption) => void
  onUseGeolocation: () => void
}

const labelFor = (l: LocationOption) => `${l.name}${l.admin1 ? `, ${l.admin1}` : ''}${l.country ? `, ${l.country}` : ''
  }`

const FavoritesBar = ({
  favorites,
  current,
  comparing,
  compareSelection,
  onAddOrRemoveCurrent,
  onRemove,
  onSelect,
  onToggleCompare,
  onToggleCompareItem,
  onUseGeolocation,
}: FavoritesBarProps) => {
  const isCurrentSaved = !!favorites.find(
    (f) => f.latitude === current?.latitude && f.longitude === current?.longitude,
  )

  const isInCompare = (fav: LocationOption) =>
    !!compareSelection.find((f) => f.latitude === fav.latitude && f.longitude === fav.longitude)

  return (
    <div className="card" style={{ padding: 'var(--space-md)' }}>
      <div className="flex-col" style={{ gap: 'var(--space-md)' }}>
        <div className="flex-row" style={{ flexWrap: 'wrap' }}>
          <button
            className={`btn ${isCurrentSaved ? 'btn-primary' : 'btn-ghost'}`}
            onClick={onAddOrRemoveCurrent}
          >
            {isCurrentSaved ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
            <span>{isCurrentSaved ? 'Salvo' : 'Favoritar'}</span>
          </button>
          <button
            className={`btn ${comparing ? 'btn-primary' : 'btn-ghost'}`}
            onClick={onToggleCompare}
          >
            <Shuffle size={16} />
            <span>Comparar</span>
          </button>
          <button className="btn btn-ghost" onClick={onUseGeolocation}>
            <Crosshair size={16} />
            <span>Minha localização</span>
          </button>
        </div>

        {favorites.length > 0 && (
          <div className="flex-row" style={{ flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {favorites.map((fav) => (
              <div
                key={`${fav.latitude}-${fav.longitude}`}
                className="flex-row"
                style={{
                  gap: 'var(--space-xs)',
                  background: comparing && isInCompare(fav) ? 'var(--color-accent-glow)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${comparing && isInCompare(fav) ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-full)',
                  padding: '0.3rem 0.4rem 0.3rem 0.8rem',
                  transition: 'var(--transition-fast)'
                }}
              >
                <button
                  onClick={() => (comparing ? onToggleCompareItem(fav) : onSelect(fav))}
                  title={labelFor(fav)}
                  className="text-sm"
                  style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}
                >
                  {fav.name}
                </button>
                <button
                  onClick={() => onRemove(fav)}
                  aria-label="Remover favorito"
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    padding: '0.2rem',
                    color: 'var(--color-text-tertiary)',
                    borderRadius: '50%'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesBar

