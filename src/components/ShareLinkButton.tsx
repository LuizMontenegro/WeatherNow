import { Share2 } from 'lucide-react'
import { useState } from 'react'

const ShareLinkButton = () => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <button className="theme-toggle glass-card" onClick={onCopy} aria-label="Copiar link">
      <Share2 size={16} />
      <span className="toggle-label">{copied ? 'Copiado!' : 'Copiar link'}</span>
    </button>
  )
}

export default ShareLinkButton

