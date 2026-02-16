import type { CVData } from '../../types/cv'
import ExperienceEditor from '../cv-edit/ExperienceEditor'

interface StepExperiencesProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepExperiences({ data, onChange }: StepExperiencesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Experiences professionnelles</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez vos experiences professionnelles, de la plus recente a la plus ancienne.
          Les champs marques d'un * sont recommandes.
        </p>
      </div>

      <ExperienceEditor
        experiences={data.experiences}
        onChange={(val) => onChange({ experiences: val })}
      />
    </div>
  )
}
