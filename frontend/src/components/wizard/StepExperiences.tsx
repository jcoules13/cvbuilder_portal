import { useRef, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { CVData, Experience } from '../../types/cv'
import ExperienceEditor from '../cv-edit/ExperienceEditor'
import AudioCapture from '../shared/AudioCapture'

interface StepExperiencesProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepExperiences({ data, onChange }: StepExperiencesProps) {
  const experiencesRef = useRef<Experience[]>(data.experiences)
  useEffect(() => { experiencesRef.current = data.experiences }, [data.experiences])

  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || ''

  const handleTranscription = async (text: string) => {
    setParsing(true)
    setParseError(null)

    try {
      // Call AI to parse the experience into structured fields
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const res = await fetch(`${webhookUrl}/cv-parse-experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: text.trim() }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`)

      const rawText = await res.text()
      if (!rawText.trim()) throw new Error('Réponse vide')

      let parsed: { periode?: string; titre?: string; entreprise?: string; description?: string }
      try {
        parsed = JSON.parse(rawText)
      } catch {
        // Try to extract JSON from response
        const match = rawText.match(/\{[\s\S]*\}/)
        if (match) {
          parsed = JSON.parse(match[0])
        } else {
          throw new Error('Impossible de parser la réponse IA')
        }
      }

      // Add the parsed experience
      onChange({
        experiences: [
          ...experiencesRef.current,
          {
            periode: parsed.periode || '',
            titre: parsed.titre || '',
            entreprise: parsed.entreprise || '',
            description: parsed.description || text.trim(),
          },
        ],
      })
    } catch (err) {
      // Fallback: add raw text as description
      setParseError('L\'IA n\'a pas pu analyser le texte. L\'expérience a été ajoutée en brut.')
      onChange({
        experiences: [
          ...experiencesRef.current,
          {
            periode: '',
            titre: '',
            entreprise: '',
            description: text.trim(),
          },
        ],
      })
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Expériences professionnelles</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez vos expériences professionnelles, de la plus récente à la plus ancienne.
        </p>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
        <p className="text-sm font-medium text-gray-700">
          🎤 Décrivez une expérience professionnelle à voix haute
        </p>
        <p className="text-xs text-gray-400">
          L'IA remplira automatiquement la période, le poste, l'entreprise et la description.
          Chaque dictée ajoute une nouvelle expérience.
        </p>

        {parsing ? (
          <div className="flex items-center gap-2 py-3 justify-center text-sm text-primary-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyse de votre expérience par l'IA...
          </div>
        ) : (
          <AudioCapture
            onTranscription={handleTranscription}
            placeholder=""
          />
        )}

        {parseError && (
          <p className="text-xs text-orange-600">{parseError}</p>
        )}
      </div>

      <ExperienceEditor
        experiences={data.experiences}
        onChange={(val) => onChange({ experiences: val })}
      />
    </div>
  )
}
