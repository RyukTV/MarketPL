"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
};

const emptyProfile: Omit<Profile, "id"> = {
  username: null,
  full_name: null,
  phone: null,
  city: null,
  avatar_url: null,
};

/**
 * Página de perfil (MVP):
 * - Requiere sesión (si no hay, redirige a /auth)
 * - Lee/crea fila en public.profiles
 * - Permite editar nombre/usuario/teléfono/ciudad
 */
export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(() => (form.full_name ? `Perfil de ${form.full_name}` : "Mi perfil"), [form.full_name]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/auth");
        return;
      }

      if (!mounted) return;

      setUserId(user.id);
      setEmail(user.email ?? null);

      // Intentar leer profile
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, phone, city, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      // Si no existe, lo creamos (upsert) con id = auth.uid()
      if (error) {
        // Si falla por RLS/tabla no creada, mostramos error claro.
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({ id: user.id }, { onConflict: "id" });

        if (upsertError) {
          setMessage(upsertError.message);
          setLoading(false);
          return;
        }

        setForm(emptyProfile);
        setLoading(false);
        return;
      }

      setForm({
        username: data.username,
        full_name: data.full_name,
        phone: data.phone,
        city: data.city,
        avatar_url: data.avatar_url,
      });

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function save() {
    if (!userId) return;
    setMessage(null);
    setSaving(true);

    try {
      const payload = {
        id: userId,
        username: form.username,
        full_name: form.full_name,
        phone: form.phone,
        city: form.city,
        avatar_url: form.avatar_url,
      };

      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      setMessage("Perfil guardado ✅");
    } catch (err: unknown) {
      const message =
      err instanceof Error ? err.message : "No se pudo guardar el perfil.";
      setMessage(message);
    }finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-gray-600 dark:text-gray-300">Cargando perfil…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {email ? <>Sesión: <span className="font-medium">{email}</span></> : "Sesión activa"}
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={form.full_name ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Usuario</label>
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={form.username ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, username: e.target.value || null }))}
              placeholder="usuario (opcional)"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">WhatsApp</label>
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={form.phone ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value || null }))}
              placeholder="+1 809 000 0000"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Se usará para el botón de contacto por WhatsApp.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Ciudad</label>
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={form.city ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, city: e.target.value || null }))}
              placeholder="Santo Domingo"
            />
          </div>
        </div>

        {message ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
            {message}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => router.refresh()}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Recargar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
