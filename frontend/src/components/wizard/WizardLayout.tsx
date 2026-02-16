import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

const STEPS = [
  'Informations',
  'Profil',
  'RQTH',
  'Competences',
  'Langues',
  'Experiences',
  'Formations',
  'Recapitulatif',
]

interface WizardLayoutProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  canNext: boolean
  isLastStep: boolean
  isSubmitting: boolean
  onSubmit: () => void
  children: React.ReactNode
}

export default function WizardLayout({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canNext,
  isLastStep,
  isSubmitting,
  onSubmit,
  children,
}: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            CV Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Creez votre CV en quelques etapes
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Etape {currentStep + 1} sur {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {STEPS[currentStep]}
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {STEPS.map((step, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full h-2 rounded-full transition-colors ${
                    index < currentStep
                      ? 'bg-primary-500'
                      : index === currentStep
                      ? 'bg-accent-500'
                      : 'bg-gray-200'
                  }`}
                />
                <span
                  className={`text-xs mt-1 hidden sm:block ${
                    index <= currentStep ? 'text-primary-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <div className="card-body p-6 sm:p-8">
            {children}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentStep === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Precedent
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canNext || isSubmitting}
              className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Enregistrer mon CV
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
