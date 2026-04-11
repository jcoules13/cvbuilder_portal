import { useState, useRef, useCallback } from 'react'
import { MapPin } from 'lucide-react'

interface Commune {
  code: string
  nom: string
  codesPostaux: string[]
}

interface CommuneAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function CommuneAutocomplete({
  value,
  onChange,
  placeholder = 'Rechercher une ville...',
}: CommuneAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Commune[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (text: string) => {
    if (text.length < 2) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(text)}&fields=code,nom,codesPostaux&boost=population&limit=6`
      )
      if (res.ok) {
        const data: Commune[] = await res.json()
        setSuggestions(data)
        setShowDropdown(true)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = (text: string) => {
    setQuery(text)
    onChange(text)
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => fetchSuggestions(text), 300)
  }

  const handleSelect = (commune: Commune) => {
    const cp = commune.codesPostaux?.[0] || ''
    const formatted = cp ? `${cp} ${commune.nom}` : commune.nom
    setQuery(formatted)
    onChange(formatted)
    setSuggestions([])
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder}
          className="input pl-9"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((c) => {
            const cp = c.codesPostaux?.[0] || ''
            return (
              <li key={c.code}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(c)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2"
                >
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white">{c.nom}</span>
                  {cp && (
                    <span className="text-xs text-gray-400 ml-auto">{cp}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
