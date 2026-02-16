/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_WEBHOOK_URL: string
  readonly VITE_RECRUTEUR_SLUG: string
  readonly VITE_PORTAL_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
