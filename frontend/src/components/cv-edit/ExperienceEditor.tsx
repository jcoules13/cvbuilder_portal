import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Experience } from '../../types/cv'

interface ExperienceEditorProps {
  experiences: Experience[]
  onChange: (experiences: Experience[]) => void
}

export default function ExperienceEditor({ experiences, onChange }: ExperienceEditorProps) {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set([0]))

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedIndices)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedIndices(newExpanded)
  }

  const handleAdd = () => {
    const newExperience: Experience = {
      periode: '',
      titre: '',
      entreprise: '',
      description: ''
    }
    onChange([...experiences, newExperience])
    setExpandedIndices(new Set([...expandedIndices, experiences.length]))
  }

  const handleRemove = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index))
    const newExpanded = new Set(expandedIndices)
    newExpanded.delete(index)
    setExpandedIndices(newExpanded)
  }

  const handleUpdate = (index: number, field: keyof Experience, value: string) => {
    const updated = experiences.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    )
    onChange(updated)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...experiences]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onChange(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === experiences.length - 1) return
    const updated = [...experiences]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="label">Experiences professionnelles</label>
        <button
          type="button"
          onClick={handleAdd}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une experience
        </button>
      </div>

      {experiences.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucune experience ajoutee
        </p>
      )}

      <div className="space-y-3">
        {experiences.map((exp, index) => {
          const isExpanded = expandedIndices.has(index)
          const hasErrors = !exp.periode || !exp.titre || !exp.entreprise

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div className="p-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpanded(index)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {exp.titre || 'Nouvelle experience'}
                    </h3>
                    {exp.entreprise && (
                      <p className="text-sm text-gray-600">
                        {exp.entreprise} {exp.periode && `- ${exp.periode}`}
                      </p>
                    )}
                    {hasErrors && !isExpanded && (
                      <p className="text-sm text-red-600">
                        Champs requis manquants
                      </p>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Monter"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === experiences.length - 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Descendre"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                    aria-label="Supprimer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        Periode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={exp.periode}
                        onChange={(e) => handleUpdate(index, 'periode', e.target.value)}
                        placeholder="ex: 2020 - 2023"
                        className={`input ${!exp.periode ? 'border-red-300' : ''}`}
                      />
                      {!exp.periode && (
                        <p className="mt-1 text-sm text-red-600">Ce champ est requis</p>
                      )}
                    </div>

                    <div>
                      <label className="label">
                        Titre du poste <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={exp.titre}
                        onChange={(e) => handleUpdate(index, 'titre', e.target.value)}
                        placeholder="ex: Developpeur Full Stack"
                        className={`input ${!exp.titre ? 'border-red-300' : ''}`}
                      />
                      {!exp.titre && (
                        <p className="mt-1 text-sm text-red-600">Ce champ est requis</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      Entreprise <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={exp.entreprise}
                      onChange={(e) => handleUpdate(index, 'entreprise', e.target.value)}
                      placeholder="ex: Acme Corp"
                      className={`input ${!exp.entreprise ? 'border-red-300' : ''}`}
                    />
                    {!exp.entreprise && (
                      <p className="mt-1 text-sm text-red-600">Ce champ est requis</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                      placeholder="Decrivez vos responsabilites et realisations..."
                      rows={4}
                      className="input"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
