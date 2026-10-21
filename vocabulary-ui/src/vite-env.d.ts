/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BMK_APP_URL?: string
  readonly VITE_BMK_APP_DOMAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
