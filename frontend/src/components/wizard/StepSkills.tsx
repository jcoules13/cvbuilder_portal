import { useState, useRef, useEffect, useMemo } from 'react'
import { Plus, X } from 'lucide-react'
import type { CVData } from '../../types/cv'
import ArrayFieldEditor from '../cv-edit/ArrayFieldEditor'
import RomeCompetenceAutocomplete from '../shared/RomeCompetenceAutocomplete'
import RomeSuggestedSkills from '../shared/RomeSuggestedSkills'
import AudioCapture from '../shared/AudioCapture'

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

/**
 * Parse a transcribed sentence into individual competences.
 * Splits on commas, semicolons, "et", periods, and line breaks.
 */
function parseCompetences(text: string): string[] {
  return text
    .split(/[,;.!?\n]+|\s+et\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2) // Ignore very short tokens
}

export default function StepSkills({ data, onChange }: StepSkillsProps) {
  const [audioAdded, setAudioAdded] = useState<string[]>([])

  // Collect ROME codes from experiences for suggestions
  const romeCodes = useMemo(
    () => [...new Set(data.experiences.filter((e) => e.code_rome).map((e) => e.code_rome!))],
    [data.experiences]
  )

  // Refs to always have latest values in closures
  const techRef = useRef<string[]>(data.competences_techniques)
  const softRef = useRef<string[]>(data.soft_skills)
  useEffect(() => { techRef.current = data.competences_techniques }, [data.competences_techniques])
  useEffect(() => { softRef.current = data.soft_skills }, [data.soft_skills])

  const handleDictation = (text: string) => {
    const parsed = parseCompetences(text)
    const current = techRef.current
    const newItems = parsed.filter((item) => !current.includes(item))

    if (newItems.length > 0) {
      onChange({ competences_techniques: [...current, ...newItems] })
      setAudioAdded(newItems)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Competences</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez vos competences techniques et vos qualites personnelles (soft skills).
        </p>
      </div>

      {/* Audio dictation section */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
        <p className="text-sm font-medium text-gray-700">
          🎤 Dictez vos compétences — elles seront ajoutées automatiquement
        </p>
        <AudioCapture
          onTranscription={handleDictation}
          placeholder=""
        />

        {audioAdded.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium mb-1">
              ✅ {audioAdded.length} compétence{audioAdded.length > 1 ? 's' : ''} ajoutée{audioAdded.length > 1 ? 's' : ''} :
            </p>
            <ul className="text-sm text-green-600 list-disc list-inside">
              {audioAdded.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>

      <TechSkillsEditor
        value={data.competences_techniques}
        onChange={(val) => onChange({ competences_techniques: val })}
      />

      {/* ROME suggested skills from experiences */}
      <RomeSuggestedSkills
        romeCodes={romeCodes}
        existingSkills={[...data.competences_techniques, ...data.soft_skills]}
        onAddSkills={(skills) =>
          onChange({ competences_techniques: [...data.competences_techniques, ...skills] })
        }
      />

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
          <p className="text-sm font-medium text-gray-700">
            🎤 Dictez vos qualités personnelles
          </p>
          <AudioCapture
            onTranscription={(text) => {
              // Split transcription into individual soft skills
              const current = softRef.current
              const items = text
                .split(/[,;.\n]+/)
                .map((s) => s.trim())
                .filter((s) => s.length > 1)
                .filter((s) => !current.includes(s))
              if (items.length > 0) {
                onChange({ soft_skills: [...current, ...items] })
              }
            }}
            placeholder=""
          />
        </div>
        <ArrayFieldEditor
          label="Qualités personnelles (soft skills)"
          value={data.soft_skills}
          onChange={(val) => onChange({ soft_skills: val })}
          placeholder="ex: Travail en équipe, Communication, Rigueur..."
          addButtonText="Ajouter"
        />
      </div>
    </div>
  )
}
