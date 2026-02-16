import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface ArrayFieldEditorProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  addButtonText?: string
}

export default function ArrayFieldEditor({
  label,
  value,
  onChange,
  placeholder = 'Ajouter un element...',
  addButtonText = 'Ajouter'
}: ArrayFieldEditorProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const trimmed = inputValue.trim()

    if (!trimmed) {
      setError('Le champ ne peut pas etre vide')
      return
    }

    if (value.includes(trimmed)) {
      setError('Cet element existe deja')
      return
    }

    onChange([...value, trimmed])
    setInputValue('')
    setError(null)
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      <label className="label">{label}</label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="hover:text-primary-900 transition-colors"
                aria-label={`Supprimer ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setError(null)
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="input flex-1"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="btn-secondary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          {addButtonText}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {value.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucun element ajoute
        </p>
      )}
    </div>
  )
}
