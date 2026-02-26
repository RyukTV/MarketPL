"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

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

  const [authed, setAuthed] = useState(false); // ✅ controla si mostramos el formulario

  const title = useMemo(
    () => (form.full_name ? `Perfil de ${form.full_name}` : "Mi perfil"),
    [form.full_name]
  );

 useEffect(() => {
  let mounted = true;

  function clearState() {
    setUserId(null);
    setEmail(null);
    setForm(emptyProfile);
  }

  async function load() {
    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        setMessage(sessionError.message);
        clearState();
        setAuthed(false);
        return;
      }

      const user = sessionData.session?.user;

      if (!user) {
        clearState();
        setAuthed(false);
        router.replace("/auth");
        return;
      }

      if (!mounted) return;

      setAuthed(true);
      setUserId(user.id);
      setEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, phone, city, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data) {
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({ id: user.id }, { onConflict: "id" });

        if (upsertError) {
          setMessage(upsertError.message);
          return;
        }

        setForm(emptyProfile);
        return;
      }

      setForm({
        username: data.username,
        full_name: data.full_name,
        phone: data.phone,
        city: data.city,
        avatar_url: data.avatar_url,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error cargando el perfil.";
      setMessage(msg);
      clearState();
      setAuthed(false);
    } finally {
      if (mounted) setLoading(false);
    }
  }

  load();

  const { data: authSub } = supabase.auth.onAuthStateChange(
    (event, session) => {
      // ✅ Solo redirigir cuando sea un logout real
      if (event === "SIGNED_OUT" && !session) {
        clearState();
        setAuthed(false);
        setLoading(false);
        router.replace("/auth");
      }
    }
  );

  return () => {
    mounted = false;
    authSub.subscription.unsubscribe();
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

      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;

      setMessage("Perfil guardado ✅");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar el perfil.";
      setMessage(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cargando perfil…
        </p>
      </div>
    );
  }

  // ✅ si no está autenticado, no renderizamos el formulario (evita “superposición”)
  if (!authed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Redirigiendo a inicio de sesión…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {email ? (
          <>
            Sesión: <span className="font-medium">{email}</span>
          </>
        ) : (
          "Sesión activa"
        )}
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={form.full_name ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, full_name: e.target.value }))
              }
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Usuario</label>
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={form.username ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, username: e.target.value || null }))
              }
              placeholder="usuario (opcional)"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">WhatsApp</label>
            <input
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={form.phone ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, phone: e.target.value || null }))
              }
              placeholder="+1 809 000 0000"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Se usará para el botón de contacto por WhatsApp.
            </p>
          </div>

          <div>
            <label className="text-sm">Ciudad</label>
            <select
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={form.city ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, city: e.target.value }))
              }
            >
              <option value="">Selecciona una ciudad</option>
              <option value="Santo Domingo">Santo Domingo</option>
              <option value="Los Mina">Los Mina</option>
              <option value="Barahona">Barahona</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Avatar (URL)</label>

            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
              {/* Input a la izquierda */}
              <div className="flex-1">
                <input
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  value={form.avatar_url ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      avatar_url: e.target.value || null,
                    }))
                  }
                  placeholder="https://..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Pega un link de imagen (jpg/png/webp).
                </p>
              </div>

              {/* Preview a la derecha */}
              <div className="flex w-full justify-start sm:w-auto sm:justify-end">
                {form.avatar_url ? (
                  <div className="h-28 w-28 overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-950">
                    <Image
                      src={form.avatar_url}
                      alt="Avatar"
                      width={112}
                      height={112}
                      className="h-28 w-28 object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-28 w-28 rounded-2xl border bg-white dark:border-gray-700 dark:bg-gray-950" />
                )}
              </div>
            </div>
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