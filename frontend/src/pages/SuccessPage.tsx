import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Mail, ExternalLink } from 'lucide-react'

export default function SuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { email, prenom } = (location.state as { email?: string; prenom?: string }) || {}

  const portalUrl = import.meta.env.VITE_PORTAL_URL || ''

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
