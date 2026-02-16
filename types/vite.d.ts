/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY: string;
  readonly VITE_TMDB_API_KEY_V3: string;
  readonly VITE_USE_DEMO_SERVER: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
