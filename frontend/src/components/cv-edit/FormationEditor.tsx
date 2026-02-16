import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Formation } from '../../types/cv'

interface FormationEditorProps {
  formations: Formation[]
  onChange: (formations: Formation[]) => void
}

export default function FormationEditor({ formations, onChange }: FormationEditorProps) {
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
    const newFormation: Formation = {
      annee: '',
      diplome: '',
      ecole: ''
    }
    onChange([...formations, newFormation])
    setExpandedIndices(new Set([...expandedIndices, formations.length]))
  }

  const handleRemove = (index: number) => {
    onChange(formations.filter((_, i) => i !== index))
    const newExpanded = new Set(expandedIndices)
    newExpanded.delete(index)
    setExpandedIndices(newExpanded)
  }

  const handleUpdate = (index: number, field: keyof Formation, value: string) => {
    const updated = formations.map((formation, i) =>
      i === index ? { ...formation, [field]: value } : formation
    )
    onChange(updated)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...formations]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onChange(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === formations.length - 1) return
    const updated = [...formations]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="label">Formations</label>
        <button
          type="button"
          onClick={handleAdd}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une formation
        </button>
      </div>

      {formations.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucune formation ajoutee
        </p>
      )}

      <div className="space-y-3">
        {formations.map((formation, index) => {
          const isExpanded = expandedIndices.has(index)
          const hasErrors = !formation.annee || !formation.diplome || !formation.ecole

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
                      {formation.diplome || 'Nouvelle formation'}
                    </h3>
                    {formation.ecole && (
                      <p className="text-sm text-gray-600">
                        {formation.ecole} {formation.annee && `- ${formation.annee}`}
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
                    disabled={index === formations.length - 1}
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
                  <div>
                    <label className="label">
                      Annee <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formation.annee}
                      onChange={(e) => handleUpdate(index, 'annee', e.target.value)}
                      placeholder="ex: 2023 ou 2020 - 2023"
                      className={`input ${!formation.annee ? 'border-red-300' : ''}`}
                    />
                    {!formation.annee && (
                      <p className="mt-1 text-sm text-red-600">Ce champ est requis</p>
                    )}
                  </div>

                  <div>
                    <label className="label">
                      Diplome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formation.diplome}
                      onChange={(e) => handleUpdate(index, 'diplome', e.target.value)}
                      placeholder="ex: Master en Informatique"
                      className={`input ${!formation.diplome ? 'border-red-300' : ''}`}
                    />
                    {!formation.diplome && (
                      <p className="mt-1 text-sm text-red-600">Ce champ est requis</p>
                    )}
                  </div>

                  <div>
                    <label className="label">
                      Ecole/Universite <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formation.ecole}
                      onChange={(e) => handleUpdate(index, 'ecole', e.target.value)}
                      placeholder="ex: Universite de Paris"
                      className={`input ${!formation.ecole ? 'border-red-300' : ''}`}
                    />
                    {!formation.ecole && (
                      <p className="mt-1 text-sm text-red-600">Ce champ est requis</p>
                    )}
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
