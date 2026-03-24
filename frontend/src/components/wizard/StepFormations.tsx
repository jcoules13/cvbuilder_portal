import { useRef, useEffect } from 'react'
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
          Chaque dictée ajoute une nouvelle formation. Vous pouvez parler plusieurs fois.
        </p>
        <AudioCapture
          onTranscription={(text) => {
            onChange({
              formations: [
                ...formationsRef.current,
                {
                  annee: '',
                  diplome: text.trim(),
                  ecole: '',
                },
              ],
            })
          }}
          placeholder=""
        />
      </div>

      <FormationEditor
        formations={data.formations}
        onChange={(val) => onChange({ formations: val })}
      />
    </div>
  )
}
