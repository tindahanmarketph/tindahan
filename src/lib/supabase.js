import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase config", {
    VITE_SUPABASE_URL: Boolean(supabaseUrl),
    VITE_SUPABASE_ANON_KEY: Boolean(supabaseAnonKey)
  });
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    storageKey: "tindahan-auth-token",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,

    // Important pour Netlify / navigateur :
    // évite que Supabase bloque l'app avec le Web Lock auth-token.
    lock: async (_name, _acquireTimeout, fn) => {
      return await fn();
    }
  }
});

export const supabaseConfig = {
  url: supabaseUrl || "",
  anonKey: supabaseAnonKey || "",
  isReady: Boolean(supabaseUrl && supabaseAnonKey)
};