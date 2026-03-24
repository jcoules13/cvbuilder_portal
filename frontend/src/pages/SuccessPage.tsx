import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Mail, ExternalLink } from 'lucide-react'

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || ''

// ─── Star Rating Component ─────────────────────────────────────────────────────

function StarRating({ onRate }: { onRate: (rating: number) => void }) {
  const [hover, setHover] = useState(0)
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleClick = (value: number) => {
    if (submitted) return
    setRating(value)
    setSubmitted(true)
    onRate(value)
  }

  if (submitted) {
    return (
      <div className="text-center space-y-2">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`text-3xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-sm text-green-500">Merci pour votre avis ! ⭐</p>
      </div>
    )
  }

  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Comment était votre expérience ? Donnez une note sur 5
      </p>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleClick(i)}
            className={`text-3xl transition-all duration-150 cursor-pointer ${
              i <= (hover || rating)
                ? 'text-yellow-400 scale-110'
                : 'text-gray-300 dark:text-gray-600'
            } hover:scale-125`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Success Page ──────────────────────────────────────────────────────────────

export default function SuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { email, prenom, candidat_id } = (location.state as {
    email?: string
    prenom?: string
    candidat_id?: string
  }) || {}

  const portalUrl = import.meta.env.VITE_PORTAL_URL || ''

  const handleRate = async (rating: number) => {
    try {
      await fetch(`${WEBHOOK_URL}/cv-satisfaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidat_id: candidat_id || null,
          rating,
          created_at: new Date().toISOString(),
        }),
      })
    } catch {
      // Silently fail — rating is non-critical
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            CV enregistre avec succes !
          </h1>

          <p className="text-gray-600 mb-6">
            {prenom ? `Merci ${prenom} ! ` : ''}
            Votre CV a ete enregistre dans notre base de donnees.
          </p>

          {/* Satisfaction stars */}
          <div className="py-4 mb-4 border-t border-b border-gray-100">
            <StarRating onRate={handleRate} />
          </div>

          {email && (
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-primary-600" />
                <p className="font-medium text-primary-800">
                  Verifiez votre boite mail
                </p>
              </div>
              <p className="text-sm text-primary-700">
                Un lien de connexion a ete envoye a <strong>{email}</strong>.
                Cliquez sur ce lien pour acceder a votre espace candidat et modifier votre CV.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {portalUrl && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Acceder a l'espace candidat
              </a>
            )}

            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary w-full"
            >
              Creer un autre CV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
