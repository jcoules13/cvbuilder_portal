import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import type { CVData } from '../../types/cv'
import RomeoPredict from '../shared/RomeoPredict'

interface StepProfileProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepProfile({ data, onChange }: StepProfileProps) {
  const [romeoOpen, setRomeoOpen] = useState(false)

  const handleRomeoSelect = (libelle: string, _codeRome: string) => {
    onChange({ titre_profil: libelle })
    setRomeoOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Profil professionnel</h2>
        <p className="text-sm text-gray-500 mt-1">
          Decrivez votre profil en quelques mots. Ces informations seront visibles par les recruteurs.
        </p>
      </div>

      <div>
        <label className="label">
          Titre du profil <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.titre_profil}
          onChange={(e) => onChange({ titre_profil: e.target.value })}
          placeholder="ex: Developpeur Full Stack, Comptable Senior, Chef de projet..."
          className={`input ${!data.titre_profil ? 'border-red-300' : ''}`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Ce titre apparaitra en tete de votre CV.
        </p>

        {/* ROMEO collapse block */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setRomeoOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
          >
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            💡 Besoin d'aide pour trouver votre métier ?
            {romeoOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {romeoOpen && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 mb-3 font-medium">
                Décrivez ce que vous faites au travail avec vos propres mots.
                L'IA va trouver le titre de métier qui correspond.
              </p>
              <RomeoPredict
                onSelect={handleRomeoSelect}
                initialText={data.titre_profil}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="label">Resume du profil</label>
        <textarea
          value={data.resume_profil}
          onChange={(e) => onChange({ resume_profil: e.target.value })}
          placeholder="Decrivez brievement votre parcours, vos points forts et ce que vous recherchez..."
          rows={6}
          maxLength={1000}
          className="input"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">
            Un resume aide les recruteurs a comprendre rapidement votre profil.
          </p>
          <p className="text-xs text-gray-400">
            {data.resume_profil.length}/1000
          </p>
        </div>
      </div>
    </div>
  )
}
