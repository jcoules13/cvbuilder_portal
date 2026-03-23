import type { CVData } from '../../types/cv'
import FormationEditor from '../cv-edit/FormationEditor'
import AudioCapture from '../shared/AudioCapture'

interface StepFormationsProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepFormations({ data, onChange }: StepFormationsProps) {
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
          Ex : "J'ai obtenu un BTS informatique en 2015 au lycée Henri IV à Paris"
        </p>
        <AudioCapture
          onTranscription={(text) => {
            onChange({
              formations: [
                ...data.formations,
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
