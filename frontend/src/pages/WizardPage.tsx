import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CVData, initialCVData } from '../types/cv'
import { submitCV } from '../lib/api'
import WizardLayout from '../components/wizard/WizardLayout'
import StepPersonalInfo from '../components/wizard/StepPersonalInfo'
import StepProfile from '../components/wizard/StepProfile'
import StepRQTH from '../components/wizard/StepRQTH'
import StepSkills from '../components/wizard/StepSkills'
import StepLanguages from '../components/wizard/StepLanguages'
import StepExperiences from '../components/wizard/StepExperiences'
import StepFormations from '../components/wizard/StepFormations'
import StepReview from '../components/wizard/StepReview'

const TOTAL_STEPS = 8

function validateStep(step: number, data: CVData): boolean {
  switch (step) {
    case 0: // Personal info
      return Boolean(data.nom.trim() && data.prenom.trim() && data.email.trim())
    case 1: // Profile
      return Boolean(data.titre_profil.trim())
    case 2: // RQTH
      return true // always valid
    case 3: // Skills
      return true // optional
    case 4: // Languages
      return true // optional
    case 5: // Experiences
      return true // optional
    case 6: // Formations
      return true // optional
    case 7: // Review
      return Boolean(
        data.nom.trim() &&
        data.prenom.trim() &&
        data.email.trim() &&
        data.titre_profil.trim()
      )
    default:
      return false
  }
}

export default function WizardPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<CVData>(initialCVData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (partial: Partial<CVData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }

  const canNext = validateStep(currentStep, data)

  const handleNext = () => {
    if (canNext && currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(7, data)) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitCV(data)

      if (result.success) {
        navigate('/success', { state: { email: data.email, prenom: data.prenom } })
      } else {
        setError(result.message || 'Une erreur est survenue lors de l\'enregistrement.')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de contacter le serveur. Veuillez reessayer.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepPersonalInfo data={data} onChange={handleChange} />
      case 1:
        return <StepProfile data={data} onChange={handleChange} />
      case 2:
        return <StepRQTH data={data} onChange={handleChange} />
      case 3:
        return <StepSkills data={data} onChange={handleChange} />
      case 4:
        return <StepLanguages data={data} onChange={handleChange} />
      case 5:
        return <StepExperiences data={data} onChange={handleChange} />
      case 6:
        return <StepFormations data={data} onChange={handleChange} />
      case 7:
        return <StepReview data={data} />
      default:
        return null
    }
  }

  return (
    <WizardLayout
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onNext={handleNext}
      onPrev={handlePrev}
      canNext={canNext}
      isLastStep={currentStep === TOTAL_STEPS - 1}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {renderStep()}
    </WizardLayout>
  )
}
