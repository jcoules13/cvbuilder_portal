import { useRef, useEffect } from 'react'
import type { CVData } from '../../types/cv'
import AudioCapture from '../shared/AudioCapture'

interface StepRQTHProps {
  data: CVData
  onChange: (data: Partial<CVData>) => void
}

export default function StepRQTH({ data, onChange }: StepRQTHProps) {
  const detailsRef = useRef<string>(data.rqth_details)
  useEffect(() => { detailsRef.current = data.rqth_details }, [data.rqth_details])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reconnaissance RQTH</h2>
        <p className="text-sm text-gray-500 mt-1">
          Indiquez si vous disposez d'une Reconnaissance de la Qualité de Travailleur Handicapé.
          Cette information est facultative.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-lg border border-primary-100">
        <input
          type="checkbox"
          id="rqth_actif"
          checked={data.rqth_actif}
          onChange={(e) => onChange({ rqth_actif: e.target.checked })}
          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="rqth_actif" className="cursor-pointer">
          <span className="font-medium text-gray-900">
            Je dispose d'une RQTH en cours de validité
          </span>
          <p className="text-sm text-gray-600 mt-1">
            La RQTH permet de bénéficier de mesures d'accompagnement spécifiques
            pour l'insertion professionnelle.
          </p>
        </label>
      </div>

      {data.rqth_actif && (
        <div>
          <label className="label">Précisions (facultatif)</label>
          <textarea
            value={data.rqth_details}
            onChange={(e) => onChange({ rqth_details: e.target.value })}
            placeholder="Vous pouvez préciser des informations complémentaires si vous le souhaitez (aménagements nécessaires, type de handicap, etc.)"
            rows={4}
            className="input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ces informations sont confidentielles et ne seront partagées qu'avec votre accord.
          </p>
          <div className="mt-2">
            <AudioCapture
              onTranscription={(text) => onChange({ rqth_details: (detailsRef.current ? detailsRef.current + ' ' : '') + text })}
              placeholder=""
            />
          </div>
        </div>
      )}
    </div>
  )
}
