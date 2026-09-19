import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Aruncat doar la runtime (build-ul static tot trece) — evita un client
  // Supabase invalid, tacut, care ar da erori confuze mai tarziu.
  // eslint-disable-next-line no-console
  console.error(
    "Lipsesc VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copiaza .env.example in .env si completeaza-le.",
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");
