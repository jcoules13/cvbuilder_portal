import { useRef, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { CVData, Formation } from '../../types/cv'
import FormationEditor from '../cv-edit/FormationEditor'
import AudioCapture from '../shared/AudioCapture'

interface StepFormationsProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepFormations({ data, onChange }: StepFormationsProps) {
  const formationsRef = useRef<Formation[]>(data.formations)
  useEffect(() => { formationsRef.current = data.formations }, [data.formations])

  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || ''

  const handleTranscription = async (text: string) => {
    setParsing(true)
    setParseError(null)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const res = await fetch(`${webhookUrl}/cv-parse-experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: `[FORMATION] ${text.trim()}` }),
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
        const match = rawText.match(/\{[\s\S]*\}/)
        if (match) {
          parsed = JSON.parse(match[0])
        } else {
          throw new Error('Impossible de parser')
        }
      }

      onChange({
        formations: [
          ...formationsRef.current,
          {
            annee: parsed.periode || '',
            diplome: parsed.titre || text.trim(),
            ecole: parsed.entreprise || '',
          },
        ],
      })
    } catch {
      setParseError('L\'IA n\'a pas pu analyser. La formation a été ajoutée en brut.')
      onChange({
        formations: [
          ...formationsRef.current,
          { annee: '', diplome: text.trim(), ecole: '' },
        ],
      })
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Formations</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez vos formations et diplômes, du plus récent au plus ancien.
        </p>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
        <p className="text-sm font-medium text-gray-700">
          🎤 Décrivez une formation à voix haute
        </p>
        <p className="text-xs text-gray-400">
          L'IA remplira automatiquement l'année, le diplôme et l'établissement.
        </p>

        {parsing ? (
          <div className="flex items-center gap-2 py-3 justify-center text-sm text-primary-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyse de votre formation par l'IA...
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

      <FormationEditor
        formations={data.formations}
        onChange={(val) => onChange({ formations: val })}
      />
    </div>
  )
}
