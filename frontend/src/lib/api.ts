import { supabase } from './supabase'
import type { CVData } from '../types/cv'

const DEFAULT_RECRUTEUR_SLUG = import.meta.env.VITE_RECRUTEUR_SLUG || 'vertigo'

interface SubmitResponse {
  success: boolean
  message: string
  candidat_id?: string
}

export async function submitCV(data: CVData, recruteurSlug?: string | null): Promise<SubmitResponse> {
  const slug = recruteurSlug || DEFAULT_RECRUTEUR_SLUG

  try {
    // 1. Find recruteur by slug
    const { data: recruteur, error: recError } = await supabase
      .from('recruteurs')
      .select('id')
      .eq('slug', slug)
      .single()

    if (recError) {
      console.warn('Recruteur not found for slug:', slug, recError.message)
    }

    // 2. Insert candidat_prive (personal data)
    const { data: candidatPrive, error: priveError } = await supabase
      .from('candidats_prive')
      .insert({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        date_naissance: data.date_naissance || null,
        adresse_ville: data.adresse_ville || null,
        permis: data.permis || null,
      })
      .select('id')
      .single()

    if (priveError) throw new Error('Erreur lors de la sauvegarde des données personnelles: ' + priveError.message)

    // 3. Insert candidat_public (CV data visible to recruteurs)
    const { data: candidatPublic, error: publicError } = await supabase
      .from('candidats_public')
      .insert({
        id: candidatPrive.id, // same ID links both records
        titre_profil: data.titre_profil || null,
        resume_profil: data.resume_profil || null,
        ville: data.adresse_ville || null,
        rqth_actif: data.rqth_actif || false,
        rqth_details: data.rqth_details || null,
        competences_techniques: data.competences_techniques || [],
        soft_skills: data.soft_skills || [],
        langues: data.langues || [],
        experiences: data.experiences || [],
        formations: data.formations || [],
        loisirs: data.loisirs || [],
      })
      .select('id')
      .single()

    if (publicError) throw new Error('Erreur lors de la sauvegarde du profil public: ' + publicError.message)

    // 4. Create recruteur-candidat link if recruteur found
    if (recruteur) {
      await supabase
        .from('recruteur_candidats')
        .insert({
          recruteur_id: recruteur.id,
          candidat_prive_id: candidatPrive.id,
          source: 'cvbuilder',
          salon_nom: null,
          date_collecte: new Date().toISOString(),
          statut: 'nouveau',
        })
    }

    return {
      success: true,
      message: 'Votre CV a été enregistré avec succès !',
      candidat_id: candidatPrive.id,
    }
  } catch (err) {
    const error = err as Error
    console.error('Submit CV error:', error)
    return {
      success: false,
      message: error.message || "Une erreur est survenue lors de l'enregistrement.",
    }
  }
}
