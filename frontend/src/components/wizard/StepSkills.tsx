import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { CVData } from '../../types/cv'
import ArrayFieldEditor from '../cv-edit/ArrayFieldEditor'
import RomeCompetenceAutocomplete from '../shared/RomeCompetenceAutocomplete'

interface StepSkillsProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

/**
 * Technical skills section — uses ROME competence autocomplete.
 * Users can also add free-text competences by typing and pressing Enter or the Add button.
 */
function TechSkillsEditor({
  value,
  onChange,
}: {
  value: string[]
  onChange: (val: string[]) => void
}) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = (libelle?: string) => {
    const trimmed = (libelle ?? inputValue).trim()
    if (!trimmed) {
      setError('Le champ ne peut pas etre vide')
      return
    }
    if (value.includes(trimmed)) {
      setError('Cette competence existe deja')
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
      <label className="label">Competences techniques</label>

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
        {/* ROME autocomplete — fills inputValue when a suggestion is selected */}
        <RomeCompetenceAutocomplete
          value={inputValue}
          onInputChange={(val) => {
            setInputValue(val)
            setError(null)
          }}
          onSelect={(libelle) => handleAdd(libelle)}
          placeholder="ex: Utiliser un logiciel, Gestion de projet..."
        />
        <button
          type="button"
          onClick={() => handleAdd()}
          onKeyPress={handleKeyPress}
          className="btn-secondary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {value.length === 0 && (
        <p className="text-sm text-gray-500">Aucune competence ajoutee</p>
      )}
    </div>
  )
}

export default function StepSkills({ data, onChange }: StepSkillsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Competences</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez vos competences techniques et vos qualites personnelles (soft skills).
        </p>
      </div>

      <TechSkillsEditor
        value={data.competences_techniques}
        onChange={(val) => onChange({ competences_techniques: val })}
      />

      <div className="border-t border-gray-200 pt-6">
        <ArrayFieldEditor
          label="Qualites personnelles (soft skills)"
          value={data.soft_skills}
          onChange={(val) => onChange({ soft_skills: val })}
          placeholder="ex: Travail en equipe, Communication, Rigueur..."
          addButtonText="Ajouter"
        />
      </div>
    </div>
  )
}
