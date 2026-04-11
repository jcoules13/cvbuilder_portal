import { User, Briefcase, Shield, Code, Globe, Building2, GraduationCap, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react'
import type { CVData } from '../../types/cv'

interface StepReviewProps {
  data: CVData
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-primary-500" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null
  return (
    <div className="text-sm">
      <span className="text-gray-500">{label}: </span>
      <span className="text-gray-900">{value}</span>
    </div>
  )
}

function Tags({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-gray-400">Aucun</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs">
          {item}
        </span>
      ))}
    </div>
  )
}

export default function StepReview({ data }: StepReviewProps) {
  const missingFields: string[] = []
  if (!data.nom) missingFields.push('Nom')
  if (!data.prenom) missingFields.push('Prenom')
  if (!data.email) missingFields.push('Email')
  if (!data.titre_profil) missingFields.push('Titre du profil')

  // ATS score calculation
  const atsChecks = [
    { label: 'Titre du profil renseigne', ok: !!data.titre_profil.trim() },
    { label: 'Code ROME associe', ok: !!data.code_rome },
    { label: 'Resume professionnel', ok: !!data.resume_profil.trim() },
    { label: 'Competences techniques (5+)', ok: data.competences_techniques.length >= 5 },
    { label: 'Soft skills renseignees', ok: data.soft_skills.length > 0 },
    { label: 'Ville avec code postal', ok: /\d{5}/.test(data.adresse_ville) },
    { label: 'Experiences professionnelles', ok: data.experiences.length > 0 },
    { label: 'Experiences avec code ROME', ok: data.experiences.some((e) => e.code_rome) },
    { label: 'Formations renseignees', ok: data.formations.length > 0 },
    { label: 'Langues renseignees', ok: data.langues.length > 0 },
  ]
  const atsScore = Math.round((atsChecks.filter((c) => c.ok).length / atsChecks.length) * 100)
  const atsColor =
    atsScore >= 80 ? 'text-green-600' : atsScore >= 50 ? 'text-amber-600' : 'text-red-600'
  const atsBgColor =
    atsScore >= 80 ? 'bg-green-500' : atsScore >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Recapitulatif</h2>
        <p className="text-sm text-gray-500 mt-1">
          Verifiez les informations de votre CV avant de l'enregistrer.
        </p>
      </div>

      {missingFields.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">
            Champs obligatoires manquants :
          </p>
          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
            {missingFields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ATS Score */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="h-5 w-5 text-indigo-500" />
          <h3 className="font-medium text-gray-900">Score de compatibilite ATS</h3>
          <span className={`ml-auto text-lg font-bold ${atsColor}`}>{atsScore}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
          <div className={`h-2 rounded-full transition-all ${atsBgColor}`} style={{ width: `${atsScore}%` }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {atsChecks.map((check, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              {check.ok ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
              )}
              <span className={check.ok ? 'text-gray-700' : 'text-gray-400'}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Un score eleve augmente la visibilite de votre CV aupres des systemes de recrutement automatises (ATS).
        </p>
      </div>

      <div className="space-y-4">
        {/* Informations personnelles */}
        <Section icon={User} title="Informations personnelles">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="Nom" value={data.nom} />
            <Field label="Prenom" value={data.prenom} />
            <Field label="Email" value={data.email} />
            <Field label="Telephone" value={data.telephone} />
            <Field label="Date de naissance" value={data.date_naissance} />
            <Field label="Ville" value={data.adresse_ville} />
            <Field label="Permis" value={data.permis} />
          </div>
        </Section>

        {/* Profil */}
        <Section icon={Briefcase} title="Profil professionnel">
          <Field label="Titre" value={data.titre_profil} />
          {data.resume_profil && (
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{data.resume_profil}</p>
          )}
        </Section>

        {/* RQTH */}
        <Section icon={Shield} title="RQTH">
          <p className="text-sm text-gray-700">
            {data.rqth_actif ? 'RQTH active' : 'Pas de RQTH declaree'}
          </p>
          {data.rqth_actif && data.rqth_details && (
            <p className="text-sm text-gray-600 mt-1">{data.rqth_details}</p>
          )}
        </Section>

        {/* Competences */}
        <Section icon={Code} title="Competences">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Competences techniques</p>
              <Tags items={data.competences_techniques} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Qualites personnelles</p>
              <Tags items={data.soft_skills} />
            </div>
          </div>
        </Section>

        {/* Langues & Loisirs */}
        <Section icon={Globe} title="Langues & Loisirs">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Langues</p>
              <Tags items={data.langues} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Loisirs</p>
              <Tags items={data.loisirs} />
            </div>
          </div>
        </Section>

        {/* Experiences */}
        <Section icon={Building2} title="Experiences professionnelles">
          {data.experiences.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune experience ajoutee</p>
          ) : (
            <div className="space-y-3">
              {data.experiences.map((exp, i) => (
                <div key={i} className="text-sm border-l-2 border-primary-200 pl-3">
                  <p className="font-medium text-gray-900">
                    {exp.titre || 'Sans titre'}
                    {exp.code_rome && (
                      <span className="ml-2 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded">
                        {exp.code_rome}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-600">{exp.entreprise} {exp.periode && `- ${exp.periode}`}</p>
                  {exp.description && (
                    <p className="text-gray-500 mt-1 line-clamp-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Formations */}
        <Section icon={GraduationCap} title="Formations">
          {data.formations.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune formation ajoutee</p>
          ) : (
            <div className="space-y-3">
              {data.formations.map((formation, i) => (
                <div key={i} className="text-sm border-l-2 border-primary-200 pl-3">
                  <p className="font-medium text-gray-900">{formation.diplome || 'Sans diplome'}</p>
                  <p className="text-gray-600">{formation.ecole} {formation.annee && `- ${formation.annee}`}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}
