import { useState, useRef } from 'react'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import type { CVData } from '../../types/cv'
import RomeoPredict from '../shared/RomeoPredict'
import AudioCapture from '../shared/AudioCapture'

interface StepProfileProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepProfile({ data, onChange }: StepProfileProps) {
  const [romeoOpen, setRomeoOpen] = useState(false)
  // Ref to imperatively set the RomeoPredict textarea value via a shared state
  const [romeoText, setRomeoText] = useState('')
  const [autoSearch, setAutoSearch] = useState(false)
  const romeoSearchRef = useRef<(() => void) | null>(null)

  const handleRomeoSelect = (libelle: string, _codeRome: string) => {
    onChange({ titre_profil: libelle })
    setRomeoOpen(false)
  }

  /**
   * Called when AudioCapture returns a transcription.
   * Opens the ROMEO block, fills the textarea, and triggers search.
   */
  const handleAudioTranscription = (text: string) => {
    setRomeoText(text)
    setRomeoOpen(true)
    setAutoSearch(true)
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
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-4">
              <p className="text-sm text-blue-800 mb-3 font-medium">
                Décrivez ce que vous faites au travail avec vos propres mots.
                L'IA va trouver le titre de métier qui correspond.
              </p>
              <RomeoPredict
                onSelect={handleRomeoSelect}
                initialText={romeoText || data.titre_profil}
                autoSearch={autoSearch}
                onAutoSearchDone={() => setAutoSearch(false)}
                searchRef={romeoSearchRef}
              />

              {/* Divider */}
              <div className="relative flex items-center my-2">
                <div className="flex-grow border-t border-blue-200" />
                <span className="mx-3 text-xs text-blue-400 font-medium">ou</span>
                <div className="flex-grow border-t border-blue-200" />
              </div>

              {/* Audio capture inside ROMEO block */}
              <div className="p-3 bg-white border border-blue-100 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                  🎤 Décrivez votre métier à voix haute
                </p>
                <AudioCapture
                  onTranscription={(text) => {
                    setRomeoText(text)
                    setAutoSearch(true)
                  }}
                  placeholder="Parlez et l'IA retranscrira ce que vous dites"
                />
              </div>
            </div>
          )}
        </div>

        {/* Audio capture outside ROMEO block — shortcut to open + fill */}
        {!romeoOpen && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">
              🎤 Ou décrivez votre métier à voix haute
            </p>
            <AudioCapture
              onTranscription={handleAudioTranscription}
              placeholder="Parlez de votre métier, l'IA trouvera la bonne appellation ROME"
            />
          </div>
        )}
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
