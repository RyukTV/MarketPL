"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

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

 useEffect(() => {
  let mounted = true;

  // 1) Cargar sesión actual
  supabase.auth.getSession().then(({ data, error }) => {
    if (!mounted) return;
    if (error) {
      setEmail(null);
      setLoading(false);
      return;
    }
    setEmail(data.session?.user?.email ?? null);
    setLoading(false);
  });

  // 2) Escuchar cambios de sesión (login/logout)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event: string, session: Session | null) => {
      setEmail(session?.user?.email ?? null);
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  async function logout() {
    await supabase.auth.signOut();
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
