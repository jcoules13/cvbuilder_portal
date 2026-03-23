import { useState } from 'react'
import { Search, CheckCircle, Loader2 } from 'lucide-react'

// ROMEO API response types
interface RomeoAppellation {
  identifiant: string
  intitule: string
  codeRome: string
  libelleRome: string
  scorePrediction: number
}

interface RomeoPredictionResult {
  appellations?: RomeoAppellation[]
  listeAppellations?: RomeoAppellation[]
}

export interface RomeoPredictProps {
  onSelect: (libelle: string, codeRome: string) => void
  initialText?: string
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return 'bg-green-500'
  if (score >= 0.6) return 'bg-orange-400'
  return 'bg-red-400'
}

function getScoreTextColor(score: number): string {
  if (score >= 0.8) return 'text-green-700'
  if (score >= 0.6) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreBgCard(score: number): string {
  if (score >= 0.8) return 'border-green-200 bg-green-50'
  if (score >= 0.6) return 'border-orange-200 bg-orange-50'
  return 'border-red-200 bg-red-50'
}

export default function RomeoPredict({ onSelect, initialText = '', className = '' }: RomeoPredictProps) {
  const [texte, setTexte] = useState(initialText)
  const [results, setResults] = useState<RomeoAppellation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || ''

  const handleSearch = async () => {
    if (!texte.trim()) return
    setLoading(true)
    setError(null)
    setResults([])
    setSelectedId(null)

    try {
      const endpoint = `${webhookUrl}/romeo-predict`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: texte.trim(), nbResultats: 5 }),
      })

      if (!res.ok) {
        throw new Error(`Erreur serveur : ${res.status}`)
      }

      const data: RomeoPredictionResult = await res.json()

      // The ROMEO v2 API wraps results per appellation
      // Shape: [{ identifiant, intitule, metiersRome: [{ codeRome, libelleRome, scorePrediction, ... }] }]
      // OR direct flat list depending on n8n response unwrapping
      let flat: RomeoAppellation[] = []

      if (Array.isArray(data)) {
        // data is array of appellation predictions
        const arr = data as Array<{
          identifiant: string
          intitule: string
          metiersRome?: Array<{ codeRome: string; libelleRome: string; scorePrediction: number }>
          appellations?: RomeoAppellation[]
        }>
        for (const item of arr) {
          if (item.metiersRome) {
            for (const metier of item.metiersRome) {
              flat.push({
                identifiant: item.identifiant,
                intitule: item.intitule,
                codeRome: metier.codeRome,
                libelleRome: metier.libelleRome,
                scorePrediction: metier.scorePrediction,
              })
            }
          }
        }
      } else if (data.appellations) {
        flat = data.appellations
      } else if (data.listeAppellations) {
        flat = data.listeAppellations
      }

      // Sort by score descending
      flat.sort((a, b) => b.scorePrediction - a.scorePrediction)

      setResults(flat.slice(0, 5))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue. Veuillez réessayer.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSearch()
    }
  }

  const handleSelect = (result: RomeoAppellation) => {
    setSelectedId(result.identifiant + result.codeRome)
    onSelect(result.intitule, result.codeRome)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input area */}
      <div className="space-y-3">
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Décrivez votre métier avec vos propres mots... par exemple : je m'occupe des personnes âgées en maison de retraite"
          rows={3}
          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none transition-colors"
          aria-label="Décrivez votre métier"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !texte.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Recherche en cours...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              🔍 Trouver mon métier
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 text-center">
          Appuyez sur Ctrl+Entrée pour lancer la recherche
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            ✅ {results.length} métier{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''} :
          </p>
          <div className="space-y-2">
            {results.map((result) => {
              const scorePercent = Math.round(result.scorePrediction * 100)
              const cardKey = result.identifiant + result.codeRome
              const isSelected = selectedId === cardKey

              return (
                <div
                  key={cardKey}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : `${getScoreBgCard(result.scorePrediction)} hover:border-primary-300`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      {/* Appellation title */}
                      <p className="font-semibold text-gray-900 text-base leading-tight">
                        {result.intitule}
                      </p>
                      {/* ROME code + label */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                          Code ROME : {result.codeRome}
                        </span>
                        {result.libelleRome && (
                          <span className="text-xs text-gray-500">{result.libelleRome}</span>
                        )}
                      </div>
                      {/* Score bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Correspondance</span>
                          <span className={`text-sm font-bold ${getScoreTextColor(result.scorePrediction)}`}>
                            {scorePercent}%
                          </span>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getScoreColor(result.scorePrediction)}`}
                            style={{ width: `${scorePercent}%` }}
                            role="progressbar"
                            aria-valuenow={scorePercent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Choose button */}
                    <button
                      type="button"
                      onClick={() => handleSelect(result)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border-2 border-primary-500 text-primary-700 hover:bg-primary-50'
                      }`}
                      aria-label={`Choisir ${result.intitule}`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Choisi
                        </>
                      ) : (
                        '✓ Choisir'
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && !error && results.length === 0 && texte.trim() && (
        <p className="text-sm text-gray-500 text-center py-2">
          Aucun résultat. Essayez de décrire différemment votre activité.
        </p>
      )}
    </div>
  )
}
