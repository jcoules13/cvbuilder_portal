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
  // ROMEO state
  const [romeoText, setRomeoText] = useState('')
  const [autoSearch, setAutoSearch] = useState(false)
  const romeoSearchRef = useRef<(() => void) | null>(null)

  // Audio for resume_profil
  const [resumeAudioOpen, setResumeAudioOpen] = useState(false)

  // AI enhance state
  const [enhancing, setEnhancing] = useState(false)
  const [enhanceError, setEnhanceError] = useState<string | null>(null)

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || ''

  const handleRomeoSelect = (libelle: string, _codeRome: string) => {
    onChange({ titre_profil: libelle })
  }

  /**
   * Called when AudioCapture (titre_profil) returns a transcription.
   * Opens ROMEO block, fills the textarea, and triggers auto-search.
   */
  const handleAudioTranscription = (text: string) => {
    setRomeoText(text)
    setAutoSearch(true)
  }

  /**
   * Called when AudioCapture (resume_profil) returns a transcription.
   * Appends/replaces the resume textarea.
   */
  const handleResumeAudioTranscription = (text: string) => {
    onChange({ resume_profil: text })
    setResumeAudioOpen(false)
  }

  /**
   * Sends current resume_profil to AI for improvement.
   */
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Profil professionnel</h2>
        <p className="text-sm text-gray-500 mt-1">
          Decrivez votre profil en quelques mots. Ces informations seront visibles par les recruteurs.
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
        <p className="text-xs text-gray-500 mt-1">
          Ce titre apparaitra en tete de votre CV.
        </p>

        {/* ROMEO block - toujours visible */}
        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
          <p className="text-sm text-blue-800 font-medium">
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
      </div>

      {/* Resume du profil */}
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

        {/* Audio + AI enhance buttons for resume */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setResumeAudioOpen((v) => !v)}
            className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🎤 Dicter mon résumé
          </button>
          <button
            type="button"
            onClick={handleEnhanceResume}
            disabled={enhancing || !data.resume_profil?.trim()}
            className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {enhancing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Amélioration...
              </>
            ) : (
              '✨ Améliorer avec l\'IA'
            )}
          </button>
        </div>

        {/* Error feedback for AI enhance */}
        {enhanceError && (
          <p className="mt-2 text-xs text-red-600">{enhanceError}</p>
        )}

        {/* Audio capture for resume */}
        {resumeAudioOpen && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
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
