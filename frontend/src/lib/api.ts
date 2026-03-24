import type { CVData } from '../types/cv'

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || ''
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

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${WEBHOOK_URL}/cv-builder-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status}`)
    }

    const text = await response.text()
    if (!text.trim()) {
      throw new Error('Réponse vide du serveur')
    }

    let result: SubmitResponse
    try {
      result = JSON.parse(text)
    } catch {
      throw new Error('Réponse invalide du serveur')
    }

    return result
  } catch (err) {
    clearTimeout(timeout)
    const error = err as Error
    return {
      success: false,
      message: error.name === 'AbortError'
        ? 'Le serveur met trop de temps à répondre. Réessayez.'
        : error.message || "Une erreur est survenue lors de l'enregistrement.",
    }
  }
}
