import type { CVData } from '../../types/cv'
import FormationEditor from '../cv-edit/FormationEditor'

interface StepFormationsProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepFormations({ data, onChange }: StepFormationsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Formations</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez vos formations et diplomes, du plus recent au plus ancien.
          Les champs marques d'un * sont recommandes.
        </p>
      </div>

      <FormationEditor
        formations={data.formations}
        onChange={(val) => onChange({ formations: val })}
      />
    </div>
  )
}
