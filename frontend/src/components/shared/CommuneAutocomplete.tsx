import { useState, useRef, useCallback, useEffect } from 'react'
import { MapPin } from 'lucide-react'

interface Commune {
  code: string          // INSEE code (e.g. "13055")
  nom: string           // City name (e.g. "Marseille")
  codesPostaux: string[]
}

interface DisplayOption {
  key: string           // unique React key
  label: string         // shown in the dropdown
  selectedValue: string // what gets written to onChange when selected
}

interface CommuneAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Convert a postal code (e.g. "13001", "75018") to a French arrondissement label.
 * Returns null if the postal code can't be parsed as an arrondissement number.
 */
function arrondissementLabel(codePostal: string): string | null {
  const last2 = parseInt(codePostal.slice(-2), 10)
  if (Number.isNaN(last2) || last2 < 1) return null
  if (last2 === 1) return '1er arrondissement'
  return `${last2}e arrondissement`
}

/**
 * Build the list of display options for a single commune returned by geo.api.gouv.fr.
 * - Single postal code (most communes): one option.
 * - Multiple postal codes (PLM = Paris/Lyon/Marseille): one option per arrondissement
 *   plus a final "toute la ville" option that uses the INSEE code as a unique identifier.
 */
function expandCommune(commune: Commune): DisplayOption[] {
  const codes = commune.codesPostaux ?? []
  if (codes.length <= 1) {
    const cp = codes[0] || ''
    const formatted = cp ? `${cp} ${commune.nom}` : commune.nom
    return [
      {
        key: `${commune.code}-single`,
        label: formatted,
        selectedValue: formatted,
      },
    ]
  }
  const sorted = [...codes].sort()
  const arrondissementOptions: DisplayOption[] = sorted.map((cp) => {
    const arr = arrondissementLabel(cp)
    const label = arr ? `${cp} ${commune.nom} (${arr})` : `${cp} ${commune.nom}`
    return {
      key: `${commune.code}-${cp}`,
      label,
      selectedValue: `${cp} ${commune.nom}`,
    }
  })
  arrondissementOptions.push({
    key: `${commune.code}-all`,
    label: `${commune.code} ${commune.nom} (toute la ville)`,
    selectedValue: `${commune.code} ${commune.nom}`,
  })
  return arrondissementOptions
}

export default function CommuneAutocomplete({
  value,
  onChange,
  placeholder = 'Rechercher une ville...',
}: CommuneAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [options, setOptions] = useState<DisplayOption[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep internal query in sync with external value (controlled component)
  useEffect(() => {
    setQuery(value)
  }, [value])

  const fetchSuggestions = useCallback(async (text: string) => {
    if (text.length < 2) {
      setOptions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(text)}&fields=code,nom,codesPostaux&boost=population&limit=6`
      )
      if (res.ok) {
        const data: Commune[] = await res.json()
        const expanded = data.flatMap(expandCommune)
        setOptions(expanded)
        setShowDropdown(true)
      }
    } catch {
      // silently fail; user keeps typing
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

  const handleSelect = (option: DisplayOption) => {
    setQuery(option.selectedValue)
    onChange(option.selectedValue)
    setOptions([])
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
          onFocus={() => options.length > 0 && setShowDropdown(true)}
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

      {showDropdown && options.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <li key={opt.key}>
              <button
                type="button"
                onMouseDown={() => handleSelect(opt)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 dark:text-white">{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
