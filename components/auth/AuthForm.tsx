"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/**
 * Formulario simple de Auth (email/password).
 * - Iniciar sesión
 * - Registrarse
 *
 * Nota: Si tu proyecto Supabase tiene "Email confirmations" activado,
 * el registro pedirá confirmar el correo antes de poder iniciar sesión.
 */
export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(() => (mode === "login" ? "Iniciar sesión" : "Crear cuenta"), [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        router.push("/profile");
        router.refresh();
        return;
      }

      // signup
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // Si hay sesión inmediatamente, mandamos a perfil.
      // Si NO hay sesión (email confirmation), mostramos mensaje.
      if (data.session) {
        router.push("/profile");
        router.refresh();
      } else {
        setMessage("Revisa tu correo para confirmar la cuenta y luego inicia sesión.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error de autenticación.";
      setMessage(message);
      }   finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        {mode === "login" ? "Accede a tu cuenta para publicar y gestionar tus anuncios." : "Regístrate para publicar en Nexamarket."}
      </p>

      <form className="mt-6 space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tuemail@correo.com"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Contraseña</label>
          <input
            type="password"
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Mínimo 6 caracteres.</p>
        </div>

        {message ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-100">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>

        <button
          type="button"
          className="w-full rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
        >
          {mode === "login" ? "No tengo cuenta" : "Ya tengo cuenta"}
        </button>
      </form>
    </div>
  );
}
