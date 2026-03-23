import type { CVData } from '../types/cv'

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || ''
// Fallback slug from env (can be overridden by URL ?ref= parameter)
const DEFAULT_RECRUTEUR_SLUG = import.meta.env.VITE_RECRUTEUR_SLUG || 'vertigo'

interface SubmitResponse {
  success: boolean
  message: string
  candidat_id?: string
}

export async function submitCV(data: CVData, recruteurSlug?: string | null): Promise<SubmitResponse> {
  const payload = {
    ...data,
    recruteur_slug: recruteurSlug || DEFAULT_RECRUTEUR_SLUG,
  }

  const response = await fetch(`${WEBHOOK_URL}/cv-builder-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Erreur serveur: ${response.status}`)
  }

  const result = await response.json()

  if (Array.isArray(result)) {
    return result[0] as SubmitResponse
  }

  return result as SubmitResponse
}
