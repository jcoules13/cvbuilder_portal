import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import type { Experience } from '../../types/cv'
import RomeMetierAutocomplete from '../shared/RomeMetierAutocomplete'
import RomeoPredict from '../shared/RomeoPredict'

interface ExperienceEditorProps {
  experiences: Experience[]
  onChange: (experiences: Experience[]) => void
}

interface RomeoModalState {
  open: boolean
  index: number | null
}

export default function ExperienceEditor({ experiences, onChange }: ExperienceEditorProps) {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set([0]))
  const [romeoModal, setRomeoModal] = useState<RomeoModalState>({ open: false, index: null })

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
      description: '',
      code_rome: undefined,
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

  const openRomeoModal = (index: number) => {
    setRomeoModal({ open: true, index })
  }

  const closeRomeoModal = () => {
    setRomeoModal({ open: false, index: null })
  }

  const handleRomeoSelect = (libelle: string, codeRome: string) => {
    if (romeoModal.index === null) return
    const updated = experiences.map((e, i) =>
      i === romeoModal.index ? { ...e, titre: libelle, code_rome: codeRome } : e
    )
    onChange(updated)
    closeRomeoModal()
  }

  const currentExp = romeoModal.index !== null ? experiences[romeoModal.index] : null

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
                      {/* Titre field + ROMEO button side by side */}
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <RomeMetierAutocomplete
                            value={exp.titre}
                            onChange={(libelle, codeRome) => {
                              const updated = experiences.map((e, i) =>
                                i === index ? { ...e, titre: libelle, code_rome: codeRome } : e
                              )
                              onChange(updated)
                            }}
                            placeholder="ex: Aide-soignant, Developpeur..."
                            hasError={!exp.titre}
                          />
                        </div>
                        {/* ROMEO helper button */}
                        <button
                          type="button"
                          onClick={() => openRomeoModal(index)}
                          className="flex-shrink-0 mt-0.5 p-2 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                          title="Trouver mon métier avec l'IA"
                          aria-label="Trouver le titre du poste avec l'IA ROMEO"
                        >
                          <Lightbulb className="h-5 w-5" />
                        </button>
                      </div>
                      {exp.code_rome && (
                        <p className="mt-1 text-xs text-primary-600">
                          Code ROME : {exp.code_rome}
                        </p>
                      )}
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

      {/* ROMEO Modal */}
      {romeoModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Trouver le titre du poste avec l'IA"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRomeoModal()
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  💡 Trouver le titre du poste
                </h3>
                {currentExp?.entreprise && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Pour le poste chez {currentExp.entreprise}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeRomeoModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5">
              <p className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                Décrivez les tâches que vous faisiez dans ce poste avec vos propres mots.
                L'IA va identifier le titre officiel.
              </p>
              <RomeoPredict
                onSelect={handleRomeoSelect}
                initialText={currentExp?.titre}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
