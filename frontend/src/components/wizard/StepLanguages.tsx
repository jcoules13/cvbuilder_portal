import { useRef, useEffect } from 'react'
import type { CVData } from '../../types/cv'
import ArrayFieldEditor from '../cv-edit/ArrayFieldEditor'
import AudioCapture from '../shared/AudioCapture'

interface StepLanguagesProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepLanguages({ data, onChange }: StepLanguagesProps) {
  const languesRef = useRef<string[]>(data.langues)
  const loisirsRef = useRef<string[]>(data.loisirs)
  useEffect(() => { languesRef.current = data.langues }, [data.langues])
  useEffect(() => { loisirsRef.current = data.loisirs }, [data.loisirs])

  const parseAndAdd = (text: string, field: 'langues' | 'loisirs') => {
    const current = field === 'langues' ? languesRef.current : loisirsRef.current
    const items = text
      .split(/[,;.\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1)
      .filter((s) => !current.includes(s))
    if (items.length > 0) {
      onChange({ [field]: [...current, ...items] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Langues & Loisirs</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez les langues que vous parlez et vos centres d'intérêt.
        </p>
      </div>

      <div className="space-y-2">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
          <p className="text-sm font-medium text-gray-700">
            🎤 Dictez vos langues
          </p>
          <AudioCapture
            onTranscription={(text) => parseAndAdd(text, 'langues')}
            placeholder=""
          />
        </div>
        <ArrayFieldEditor
          label="Langues"
          value={data.langues}
          onChange={(val) => onChange({ langues: val })}
          placeholder="ex: Français (natif), Anglais (courant), Espagnol (B1)..."
          addButtonText="Ajouter"
        />
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
          <p className="text-sm font-medium text-gray-700">
            🎤 Dictez vos loisirs et centres d'intérêt
          </p>
          <AudioCapture
            onTranscription={(text) => parseAndAdd(text, 'loisirs')}
            placeholder=""
          />
        </div>
        <ArrayFieldEditor
          label="Loisirs et centres d'intérêt"
          value={data.loisirs}
          onChange={(val) => onChange({ loisirs: val })}
          placeholder="ex: Lecture, Randonnée, Musique..."
          addButtonText="Ajouter"
        />
      </div>
    </div>
  )
}
