import { useState, useEffect, useRef, useCallback } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface RomeCompetence {
  code: string
  libelle: string
  type: string
}

interface RomeCompetenceAutocompleteProps {
  onSelect: (libelle: string, code?: string) => void
  placeholder?: string
  /** Current input value (controlled) */
  value?: string
  /** Called on every keystroke for controlled input */
  onInputChange?: (val: string) => void
}

/** Badge color by competence type */
const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  'SAVOIR': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Savoir' },
  'COMPETENCE-DETAILLEE': { bg: 'bg-green-100', text: 'text-green-700', label: 'Compétence' },
  'MACRO-SAVOIR-FAIRE': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Savoir-faire' },
  'MACRO-SAVOIR-ETRE': { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Savoir-être' },
}

function TypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: type }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}

export default function RomeCompetenceAutocomplete({
  onSelect,
  placeholder = 'ex: Utiliser un logiciel...',
  value: externalValue,
  onInputChange,
}: RomeCompetenceAutocompleteProps) {
  const [query, setQuery] = useState(externalValue ?? '')
  const [results, setResults] = useState<RomeCompetence[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value
  useEffect(() => {
    if (externalValue !== undefined) setQuery(externalValue)
  }, [externalValue])

  const search = useCallback(async (text: string) => {
    if (text.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('search_rome_competences', {
        search_text: text,
        comp_type: null,
        result_limit: 8,
      })
      if (!error && data) {
        setResults(data as RomeCompetence[])
        setIsOpen(true)
        setActiveIndex(-1)
      }
    } catch {
      // silent fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onInputChange?.(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelect = (comp: RomeCompetence) => {
    setQuery('')
    onInputChange?.('')
    onSelect(comp.libelle, comp.code)
    setIsOpen(false)
    setResults([])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        if (isOpen) {
          e.preventDefault()
          setActiveIndex((i) => Math.min(i + 1, results.length - 1))
        }
        break
      case 'ArrowUp':
        if (isOpen) {
          e.preventDefault()
          setActiveIndex((i) => Math.max(i - 1, -1))
        }
        break
      case 'Enter':
        if (isOpen && activeIndex >= 0 && results[activeIndex]) {
          e.preventDefault()
          handleSelect(results[activeIndex])
        }
        // If no suggestion selected, let parent handle Enter (add free text)
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const listId = 'rome-competence-listbox'

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {isLoading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `rome-comp-option-${activeIndex}` : undefined}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder={placeholder}
          className="input pl-9 w-full"
          autoComplete="off"
        />
      </div>

      {isOpen && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions de competences ROME"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-200"
        >
          {results.map((comp, index) => (
            <li
              key={comp.code}
              id={`rome-comp-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(comp) }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
                index === activeIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
              } ${index > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-snug">{comp.libelle}</p>
                <div className="mt-1">
                  <TypeBadge type={comp.type} />
                </div>
              </div>
            </li>
          ))}
          <li className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 bg-gray-50">
            Appuyez sur Entrée pour ajouter sans suggestion
          </li>
        </ul>
      )}
    </div>
  )
}
