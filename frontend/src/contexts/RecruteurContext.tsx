import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface RecruteurContextType {
  recruteurSlug: string | null
}

const RecruteurContext = createContext<RecruteurContextType>({ recruteurSlug: null })

export function RecruteurProvider({ children }: { children: ReactNode }) {
  const [recruteurSlug, setRecruteurSlug] = useState<string | null>(null)

  useEffect(() => {
    // Read ?ref= from URL
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref') || params.get('recruteur') || params.get('r')
    if (ref) {
      setRecruteurSlug(ref)
      // Store in sessionStorage so it persists during the session
      sessionStorage.setItem('cv-recruteur-ref', ref)
    } else {
      // Check sessionStorage fallback
      const stored = sessionStorage.getItem('cv-recruteur-ref')
      if (stored) setRecruteurSlug(stored)
    }
  }, [])

  return (
    <RecruteurContext.Provider value={{ recruteurSlug }}>
      {children}
    </RecruteurContext.Provider>
  )
}

export const useRecruteur = () => useContext(RecruteurContext)
