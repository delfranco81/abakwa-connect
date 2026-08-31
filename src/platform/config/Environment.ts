export const Environment = {
  appName: "Everyday Connect",
  version: "1.0.0",
  environment: import.meta.env.MODE,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};