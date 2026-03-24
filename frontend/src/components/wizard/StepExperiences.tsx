import { useRef, useEffect } from 'react'
import type { CVData, Experience } from '../../types/cv'
import ExperienceEditor from '../cv-edit/ExperienceEditor'
import AudioCapture from '../shared/AudioCapture'

interface StepExperiencesProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepExperiences({ data, onChange }: StepExperiencesProps) {
  // Use ref to always have the latest experiences in the closure
  const experiencesRef = useRef<Experience[]>(data.experiences)
  useEffect(() => { experiencesRef.current = data.experiences }, [data.experiences])

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
          Chaque dictée ajoute une nouvelle expérience. Vous pouvez parler plusieurs fois.
        </p>
        <AudioCapture
          onTranscription={(text) => {
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
          }}
          placeholder=""
        />
      </div>

      <ExperienceEditor
        experiences={data.experiences}
        onChange={(val) => onChange({ experiences: val })}
      />
    </div>
  )
}
