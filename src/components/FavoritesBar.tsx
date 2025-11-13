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

const labelFor = (l: LocationOption) => `${l.name}${l.admin1 ? `, ${l.admin1}` : ''}${
  l.country ? `, ${l.country}` : ''
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
    <div className="favorites-bar glass-card">
      <div className="fav-actions">
        <button className={`fav-btn ${isCurrentSaved ? 'saved' : ''}`} onClick={onAddOrRemoveCurrent}>
          {isCurrentSaved ? <Star size={16} /> : <StarOff size={16} />}
          <span>{isCurrentSaved ? 'Salvo' : 'Favoritar'}</span>
        </button>
        <button className={`fav-btn ${comparing ? 'active' : ''}`} onClick={onToggleCompare}>
          <Shuffle size={16} />
          <span>Comparar</span>
        </button>
        <button className="fav-btn" onClick={onUseGeolocation}>
          <Crosshair size={16} />
          <span>Minha localização</span>
        </button>
      </div>

      <div className="fav-list">
        {favorites.map((fav) => (
          <div
            key={`${fav.latitude}-${fav.longitude}`}
            className={`chip ${comparing && isInCompare(fav) ? 'chip-active' : ''}`}
          >
            <button
              className="chip-main"
              onClick={() => (comparing ? onToggleCompareItem(fav) : onSelect(fav))}
              title={labelFor(fav)}
            >
              {labelFor(fav)}
            </button>
            <button className="chip-remove" onClick={() => onRemove(fav)} aria-label="Remover favorito">
              <X size={14} />
            </button>
          </div>
        ))}
        {favorites.length === 0 && <span className="muted">Nenhum favorito ainda</span>}
      </div>
    </div>
  )
}

export default FavoritesBar

