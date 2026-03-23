import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Briefcase } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface RomeMetier {
  code_rome: string
  libelle: string
}

interface RomeMetierAutocompleteProps {
  value: string
  onChange: (libelle: string, codeRome?: string) => void
  placeholder?: string
  hasError?: boolean
}

export default function RomeMetierAutocomplete({
  value,
  onChange,
  placeholder = 'ex: Aide-soignant, Comptable...',
  hasError = false,
}: RomeMetierAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<RomeMetier[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Sync external value changes
  useEffect(() => {
    setQuery(value)
  }, [value])

  const search = useCallback(async (text: string) => {
    if (text.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('search_rome_metiers', {
        search_text: text,
        result_limit: 8,
      })
      if (!error && data) {
        setResults(data as RomeMetier[])
        setIsOpen(true)
        setActiveIndex(-1)
      }
    } catch {
      // silent fail — user can still type freely
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    // Propagate free-text immediately (no codeRome)
    onChange(val, undefined)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelect = (metier: RomeMetier) => {
    setQuery(metier.libelle)
    onChange(metier.libelle, metier.code_rome)
    setIsOpen(false)
    setResults([])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && results[activeIndex]) {
          handleSelect(results[activeIndex])
        }
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

  const listId = 'rome-metier-listbox'

  return (
    <div ref={containerRef} className="relative">
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
          aria-activedescendant={activeIndex >= 0 ? `rome-metier-option-${activeIndex}` : undefined}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder={placeholder}
          className={`input pl-9 ${hasError ? 'border-red-300' : ''}`}
          autoComplete="off"
        />
      </div>

      {isOpen && results.length > 0 && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Suggestions de metiers ROME"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-200"
        >
          {results.map((metier, index) => (
            <li
              key={metier.code_rome}
              id={`rome-metier-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(metier) }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
                index === activeIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
              } ${index > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <Briefcase className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary-500" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-snug">{metier.libelle}</p>
                <p className="text-xs text-gray-500 mt-0.5">{metier.code_rome}</p>
              </div>
            </li>
          ))}
          <li className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 bg-gray-50">
            Vous pouvez aussi ecrire librement votre intitule de poste
          </li>
        </ul>
      )}
    </div>
  )
}
