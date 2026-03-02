"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  getMyListings,
  getListingImagePublicUrl,
} from "@/features/listings/listings.service";
import { getCategories } from "@/features/categories/categories.service";
import { listingToUiProduct, type UiProduct } from "@/features/listings/adapters";
import { deleteListing } from "@/features/listings/listings.service";
import Link from "next/link";
import type { Listing } from "@/features/listings/types";

type ListingImageRow = {
  path: string;
  sort_order: number | null;
};

type ListingWithImages = {
  id: string;
  title: string;
  price: number | string;
  city: string | null;
  category_id: number | null;
  description: string | null;
  listing_images?: ListingImageRow[] | null;
};

export default function MyListingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [items, setItems] = useState<UiProduct[]>([]);

  useEffect(() => {
    let mounted = true;

    async function guard() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/auth");
        return false;
      }
      return true;
    }

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const ok = await guard();
        if (!ok) return;

        const [listings, cats] = await Promise.all([
          getMyListings(),
          getCategories(),
        ]);

        const map: Record<number, string> = {};
        cats.forEach((c) => (map[c.id] = c.name));

        // ✅ Adaptar listings -> UiProduct, usando primera imagen real si existe
          const ui = (listings as Listing[]).map((l) => {
          const imgs = Array.isArray(l.listing_images) ? l.listing_images : [];
          const firstPath = imgs[0]?.path;
          const imageUrl = firstPath ? getListingImagePublicUrl(firstPath) : undefined;

          return listingToUiProduct(
            l,
            l.category_id ? map[l.category_id] : undefined,
            imageUrl
          );
        });

        if (!mounted) return;
        setItems(ui);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Error cargando tus publicaciones.";
        if (!mounted) return;
        setErrorMsg(msg);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Botones placeholder (NO implementan nada todavía)
  function onEdit(id: string) {
    alert(`Editar (pendiente) — id: ${id}`);
  }

  async function onDelete(uuidOrId: string) {
    const ok = confirm("¿Seguro que quieres eliminar esta publicación?");
    if (!ok) return;

    try {
      await deleteListing(uuidOrId);

      // Quitar del estado local para que desaparezca sin recargar
      setItems((prev) => prev.filter((p) => p.id !== uuidOrId));

      alert("Publicación eliminada ✅");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo eliminar.";
      alert(msg);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis publicaciones</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Aquí verás lo que tú has publicado.
          </p>
        </div>

        <Link
          href="/sell"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Publicar
        </Link>
      </div>

      {loading && <p className="mt-6 text-sm">Cargando…</p>}
      {errorMsg && <p className="mt-6 text-sm text-red-600">{errorMsg}</p>}

      {!loading && !errorMsg && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              {/* ✅ Imagen principal */}
              <img
                src={p.image}
                alt={p.title}
                className="mb-3 h-40 w-full rounded-lg object-cover"
              />

              {/* Click en el título (o card) abre el detalle */}
              <Link href={`/listing/${p.id}`} className="block">
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {p.category} • {p.location}
                </p>
                <p className="mt-2 font-semibold">
                  DOP {p.price.toLocaleString()}
                </p>
              </Link>

              {/* Botones (solo UI por ahora) */}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => onEdit(p.id)}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  type="button"
                >
                  Editar
                </button>

                <button
                  onClick={() => onDelete(p.id)}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
                  type="button"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}