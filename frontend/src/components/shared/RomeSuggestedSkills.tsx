import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Check, Plus, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface RomeCompetence {
  code: string
  libelle: string
  type: string
}

interface RomeSuggestedSkillsProps {
  romeCodes: string[]
  existingSkills: string[]
  onAddSkills: (skills: string[]) => void
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  'SAVOIR': { label: 'Savoir', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  'COMPETENCE-DETAILLEE': { label: 'Competence', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  'MACRO-SAVOIR-FAIRE': { label: 'Savoir-faire', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  'MACRO-SAVOIR-ETRE': { label: 'Savoir-etre', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
}

export default function RomeSuggestedSkills({
  romeCodes,
  existingSkills,
  onAddSkills,
}: RomeSuggestedSkillsProps) {
  const [suggestions, setSuggestions] = useState<RomeCompetence[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const existingLower = new Set(existingSkills.map((s) => s.toLowerCase()))

  const fetchCompetences = useCallback(async () => {
    if (romeCodes.length === 0) return
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any

      // Get competence codes linked to these ROME codes
      const { data: links } = await sb
        .from('rome_metier_competences')
        .select('code_competence')
        .in('code_rome', romeCodes)

      if (!links || links.length === 0) {
        setLoading(false)
        setLoaded(true)
        return
      }

      const codes = [...new Set(links.map((l: { code_competence: string }) => l.code_competence))]

      // Get competence details
      const { data: comps } = await sb
        .from('rome_competences')
        .select('code, libelle, type')
        .in('code', codes)
        .order('type')
        .limit(30)

      if (comps) {
        // Filter out already existing skills
        const filtered = (comps as RomeCompetence[]).filter(
          (c) => !existingLower.has(c.libelle.toLowerCase())
        )
        setSuggestions(filtered)
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [romeCodes.join(','), existingSkills.length])

  useEffect(() => {
    if (romeCodes.length > 0 && !loaded) {
      fetchCompetences()
    }
  }, [romeCodes.length, loaded, fetchCompetences])

  const toggleSelect = (libelle: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(libelle)) next.delete(libelle)
      else next.add(libelle)
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(suggestions.map((s) => s.libelle)))
  }

  const handleAdd = () => {
    onAddSkills([...selected])
    // Remove added from suggestions
    setSuggestions((prev) => prev.filter((s) => !selected.has(s.libelle)))
    setSelected(new Set())
  }

  if (romeCodes.length === 0) return null
  if (loaded && suggestions.length === 0) return null

  return (
    <div className="mt-4 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Competences suggerees (ROME)
          </h4>
        </div>
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Tout selectionner
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Basees sur les codes ROME de vos experiences. Selectionnez celles qui correspondent a votre profil.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s) => {
              const isSelected = selected.has(s.libelle)
              const typeInfo = TYPE_LABELS[s.type] || { label: s.type, color: 'bg-gray-100 text-gray-600' }
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => toggleSelect(s.libelle)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
                  }`}
                >
                  {isSelected ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                  {s.libelle}
                  {!isSelected && (
                    <span className={`ml-1 px-1.5 py-0 rounded text-[10px] ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {selected.size > 0 && (
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter {selected.size} competence{selected.size > 1 ? 's' : ''}
            </button>
          )}
        </>
      )}
    </div>
  )
}
