import type { CVData } from '../../types/cv'

interface StepPersonalInfoProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepPersonalInfo({ data, onChange }: StepPersonalInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ces informations sont confidentielles et ne seront pas visibles par les recruteurs sans votre accord.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.nom}
            onChange={(e) => onChange({ nom: e.target.value })}
            placeholder="Dupont"
            className={`input ${!data.nom ? 'border-red-300' : ''}`}
          />
        </div>

        <div>
          <label className="label">
            Prenom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.prenom}
            onChange={(e) => onChange({ prenom: e.target.value })}
            placeholder="Jean"
            className={`input ${!data.prenom ? 'border-red-300' : ''}`}
          />
        </div>
      </div>

      <div>
        <label className="label">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="jean.dupont@email.com"
          className={`input ${!data.email ? 'border-red-300' : ''}`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Un lien de connexion vous sera envoye a cette adresse pour acceder a votre espace candidat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Telephone</label>
          <input
            type="tel"
            value={data.telephone}
            onChange={(e) => onChange({ telephone: e.target.value })}
            placeholder="06 12 34 56 78"
            className="input"
          />
        </div>

        <div>
          <label className="label">Date de naissance</label>
          <input
            type="date"
            value={data.date_naissance}
            onChange={(e) => onChange({ date_naissance: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Ville</label>
          <input
            type="text"
            value={data.adresse_ville}
            onChange={(e) => onChange({ adresse_ville: e.target.value })}
            placeholder="Paris"
            className="input"
          />
        </div>

        <div>
          <label className="label">Permis</label>
          <input
            type="text"
            value={data.permis}
            onChange={(e) => onChange({ permis: e.target.value })}
            placeholder="B"
            className="input"
          />
        </div>
      </div>
    </div>
  )
}
