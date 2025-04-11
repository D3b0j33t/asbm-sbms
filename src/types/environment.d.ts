
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
      [key: string]: string | undefined;
    }
  }
}

// This makes it a module file
export {};
