import type { CVData } from '../../types/cv'
import ArrayFieldEditor from '../cv-edit/ArrayFieldEditor'

interface StepLanguagesProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepLanguages({ data, onChange }: StepLanguagesProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Langues & Loisirs</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez les langues que vous parlez et vos centres d'interet.
        </p>
      </div>

      <ArrayFieldEditor
        label="Langues"
        value={data.langues}
        onChange={(val) => onChange({ langues: val })}
        placeholder="ex: Francais (natif), Anglais (courant), Espagnol (B1)..."
        addButtonText="Ajouter"
      />

      <div className="border-t border-gray-200 pt-6">
        <ArrayFieldEditor
          label="Loisirs et centres d'interet"
          value={data.loisirs}
          onChange={(val) => onChange({ loisirs: val })}
          placeholder="ex: Lecture, Randonnee, Musique..."
          addButtonText="Ajouter"
        />
      </div>
    </div>
  )
}
