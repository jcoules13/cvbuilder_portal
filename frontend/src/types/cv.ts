export interface Experience {
  periode: string
  titre: string
  entreprise: string
  description: string
}

export interface Formation {
  annee: string
  diplome: string
  ecole: string
}

export interface CVData {
  // Prive
  nom: string
  prenom: string
  email: string
  telephone: string
  date_naissance: string
  adresse_ville: string
  permis: string
  // Public
  titre_profil: string
  resume_profil: string
  rqth_actif: boolean
  rqth_details: string
  competences_techniques: string[]
  soft_skills: string[]
  langues: string[]
  loisirs: string[]
  experiences: Experience[]
  formations: Formation[]
}

export const initialCVData: CVData = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  date_naissance: '',
  adresse_ville: '',
  permis: '',
  titre_profil: '',
  resume_profil: '',
  rqth_actif: false,
  rqth_details: '',
  competences_techniques: [],
  soft_skills: [],
  langues: [],
  loisirs: [],
  experiences: [],
  formations: [],
}
