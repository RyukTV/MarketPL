"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Image from "next/image";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/sell", label: "Publicar" },
  { href: "/my-listings", label: "Mis publicaciones" },
  { href: "/profile", label: "Perfil" },
  { href: "/about", label: "Nosotros" },
];

/**
 * Navbar global.
 * - Links principales del proyecto
 * - Botón de Login/Logout conectado a Supabase Auth
 */
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Helper: cargar avatar desde profiles
    async function loadAvatar(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;
      setAvatarUrl(data?.avatar_url ?? null);
    }

    // ✅ Helper: sincronizar estado del navbar desde sesión/usuario
    async function syncAuthState() {
      if (!mounted) return;
      setLoading(true);

      // 1) Intentar sesión normal
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setEmail(null);
        setAvatarUrl(null);
        setLoading(false);
        return;
      }

      const session = sessionData.session;

      // 2) Si no hay sesión pero hay usuario, intenta recuperar
      // (algunos navegadores tardan en rehidratar session)
      if (!session) {
        const { data: userData } = await supabase.auth.getUser();
        if (!mounted) return;

        const user = userData.user;
        if (!user) {
          setEmail(null);
          setAvatarUrl(null);
          setLoading(false);
          return;
        }

        setEmail(user.email ?? null);
        await loadAvatar(user.id);
        setLoading(false);
        return;
      }

      // 3) Caso normal: sesión presente
      setEmail(session.user.email ?? null);
      await loadAvatar(session.user.id);
      setLoading(false);
    }

    // 1) Cargar al iniciar
    syncAuthState();

    // ✅ 2) Revalidar al volver a enfocar la pestaña (Opera/Brave a veces “duerme”)
    const onFocus = () => {
      syncAuthState();
    };
    window.addEventListener("focus", onFocus);

    // 3) Escuchar cambios de sesión (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (!mounted) return;

      setEmail(session?.user?.email ?? null);

      const uid = session?.user?.id;
      if (!uid) {
        setAvatarUrl(null);
        return;
      }

      await loadAvatar(uid);
    });

    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();

    // Limpia estado local del navbar (para que cambie instantáneo)
    setEmail(null);
    setAvatarUrl(null);

    // Redirige al inicio y fuerza refresco
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-base font-semibold">
          Nexamarket
        </Link>

        <nav className="flex flex-1 items-center gap-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-lg px-3 py-1.5 text-sm transition " +
                  (active
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && email ? (
            <>
              {/* Avatar (click -> /profile) */}
              <button
                onClick={() => router.push("/profile")}
                className="h-9 w-9 overflow-hidden rounded-full border dark:border-gray-700"
                title="Ir a perfil"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={36}
                    height={36}
                    className="h-9 w-9 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center bg-gray-100 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    {email[0]?.toUpperCase()}
                  </div>
                )}
              </button>

              <span className="hidden max-w-[220px] truncate text-xs text-gray-600 dark:text-gray-300 sm:block">
                {email}
              </span>

              <button
                onClick={logout}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}