"use client";

import { useState } from "react";
import type { AuthMode } from "./types";
import { loginWithPassword, signupWithPassword } from "./auth.service";

/**
 * AuthForm (Nexamarket)
 *
 * Objetivo:
 * - Dejar REGISTRO funcionando (para probar que llega la info a Supabase).
 * - Dejar LOGIN como PLANTILLA para que tu compañero lo complete.
 *
 * ¿Qué falta completar?
 * - Implementar loginWithPassword(...) en auth.service.ts
 * - Reemplazar el throw por la llamada a supabase.auth.signInWithPassword(...)
 */
export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "signup") {
        await signupWithPassword(email, password);
        setMessage("Cuenta creada ✅ (Revisa tu correo si hay confirmación).");
      } else {
        // PLANTILLA: esto fallará a propósito hasta que implementen login.
        await loginWithPassword(email, password);
        setMessage("Sesión iniciada ✅");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error de autenticación.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <h1 className="text-xl font-semibold">
        {mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}
      </h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        {mode === "signup"
          ? "Regístrate para publicar en Nexamarket."
          : "PLANTILLA: el login lo completará tu compañero."}
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="text-sm">Email</label>
          <input
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            type="email"
            required
          />
        </div>

        <div>
          <label className="text-sm">Contraseña</label>
          <input
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            type="password"
            minLength={6}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Mínimo 6 caracteres.
          </p>
        </div>

        <button
          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading
            ? "Procesando..."
            : mode === "signup"
              ? "Crear cuenta"
              : "Entrar"}
        </button>

        {message && (
          <p className="rounded-lg border px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-100">
            {message}
          </p>
        )}
      </form>

      <div className="mt-4">
        {mode === "signup" ? (
          <button
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700"
            onClick={() => setMode("login")}
            type="button"
          >
            Ya tengo cuenta
          </button>
        ) : (
          <button
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700"
            onClick={() => setMode("signup")}
            type="button"
          >
            Crear cuenta
          </button>
        )}
      </div>
    </div>
  );
}
