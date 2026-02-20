import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el navegador.
 * Usa variables NEXT_PUBLIC_* para poder ejecutarse en el client.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
