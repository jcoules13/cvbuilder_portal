import { useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import type { CVData } from '../../types/cv'
import RomeoPredict from '../shared/RomeoPredict'
import AudioCapture from '../shared/AudioCapture'

interface StepProfileProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepProfile({ data, onChange }: StepProfileProps) {
  const [romeoText, setRomeoText] = useState('')
  const [autoSearch, setAutoSearch] = useState(false)
  const romeoSearchRef = useRef<(() => void) | null>(null)

  // Resume audio
  const [resumeAudioOpen, setResumeAudioOpen] = useState(false)

  // AI enhance state
  const [enhancing, setEnhancing] = useState(false)
  const [enhanceError, setEnhanceError] = useState<string | null>(null)

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || ''

  const handleRomeoSelect = (libelle: string, _codeRome: string) => {
    onChange({ titre_profil: libelle })
  }

  const handleResumeAudioTranscription = (text: string) => {
    onChange({ resume_profil: text })
    setResumeAudioOpen(false)
  }

  const handleEnhanceResume = async () => {
    const texte = data.resume_profil?.trim()
    if (!texte) return
    setEnhancing(true)
    setEnhanceError(null)
    try {
      const res = await fetch(`${webhookUrl}/cv-enhance-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texte,
          titre_profil: data.titre_profil || '',
          nom: data.nom || '',
          prenom: data.prenom || '',
        }),
      })
      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`)
      const result = await res.json()
      const improved: string = result.text || ''
      if (!improved.trim()) throw new Error('Réponse vide reçue')
      onChange({ resume_profil: improved.trim() })
    } catch (err: unknown) {
      const error = err as Error
      setEnhanceError('Erreur : ' + (error?.message || 'Veuillez réessayer'))
    } finally {
      setEnhancing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Profil professionnel</h2>
        <p className="text-sm text-gray-500 mt-1">
          Décrivez votre profil en quelques mots. Ces informations seront visibles par les recruteurs.
        </p>
      </div>

      {/* Titre du profil */}
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
      </div>

      {/* ROMEO block - toujours visible */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
        <p className="text-sm text-blue-800 font-medium">
          💡 Décrivez ce que vous faites au travail — l'IA trouvera votre titre de métier.
        </p>
        <RomeoPredict
          onSelect={handleRomeoSelect}
          initialText={romeoText || data.titre_profil}
          autoSearch={autoSearch}
          onAutoSearchDone={() => setAutoSearch(false)}
          searchRef={romeoSearchRef}
          audioSlot={
            <AudioCapture
              onTranscription={(text) => {
                setRomeoText(text)
                setAutoSearch(true)
              }}
              placeholder=""
            />
          }
        />
      </div>

      {/* Resume du profil */}
      <div>
        <label className="label">Résumé du profil</label>
        <textarea
          value={data.resume_profil}
          onChange={(e) => onChange({ resume_profil: e.target.value })}
          placeholder="Décrivez brièvement votre parcours, vos points forts et ce que vous recherchez..."
          rows={5}
          maxLength={1000}
          className="input"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">
            Un résumé aide les recruteurs à comprendre rapidement votre profil.
          </p>
          <p className="text-xs text-gray-400">
            {data.resume_profil.length}/1000
          </p>
        </div>

        {/* Buttons row: Parler + Améliorer IA */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setResumeAudioOpen((v) => !v)}
            className="flex items-center gap-1.5 py-2 px-4 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
          >
            🎤 Parler
          </button>
          <button
            type="button"
            onClick={handleEnhanceResume}
            disabled={enhancing || !data.resume_profil?.trim()}
            className="flex items-center gap-1.5 py-2 px-4 text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {enhancing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Amélioration...
              </>
            ) : (
              '✨ Améliorer avec l\'IA'
            )}
          </button>
        </div>

        {enhanceError && (
          <p className="mt-1 text-xs text-red-600">{enhanceError}</p>
        )}

        {resumeAudioOpen && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <AudioCapture
              onTranscription={handleResumeAudioTranscription}
              placeholder="Parlez de votre parcours et de vos points forts"
            />
          </div>
        )}
      </div>
    </div>
  )
}
