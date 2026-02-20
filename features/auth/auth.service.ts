import { supabase } from "@/lib/supabase/client";

/**
 * PLANTILLA (TODO):
 * Implementar login real.
 *
 * Pista:
 *   await supabase.auth.signInWithPassword({ email, password })
 */
export async function loginWithPassword(email: string, password: string) {
  // TODO: reemplazar por implementación real
  // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  // if (error) throw error;
  // return data;
  throw new Error("Login no implementado todavía (plantilla).");
}

/**
 * Registro (Signup) REAL.
 * - Trim para evitar errores por espacios invisibles.
 * - Lowercase para normalizar.
 */
export async function signupWithPassword(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Cerrar sesión (Logout) REAL.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
