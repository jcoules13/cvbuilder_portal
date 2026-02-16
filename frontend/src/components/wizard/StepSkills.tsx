import type { CVData } from '../../types/cv'
import ArrayFieldEditor from '../cv-edit/ArrayFieldEditor'

interface StepSkillsProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepSkills({ data, onChange }: StepSkillsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Competences</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez vos competences techniques et vos qualites personnelles (soft skills).
        </p>
      </div>

      <ArrayFieldEditor
        label="Competences techniques"
        value={data.competences_techniques}
        onChange={(val) => onChange({ competences_techniques: val })}
        placeholder="ex: JavaScript, Gestion de projet, Excel..."
        addButtonText="Ajouter"
      />

      <div className="border-t border-gray-200 pt-6">
        <ArrayFieldEditor
          label="Qualites personnelles (soft skills)"
          value={data.soft_skills}
          onChange={(val) => onChange({ soft_skills: val })}
          placeholder="ex: Travail en equipe, Communication, Rigueur..."
          addButtonText="Ajouter"
        />
      </div>
    </div>
  )
}
