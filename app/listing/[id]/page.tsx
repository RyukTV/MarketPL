"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getListingById } from "@/features/listings/listings.service";
import { getCategories } from "@/features/categories/categories.service";
import { listingToUiProduct, type UiProduct } from "@/features/listings/adapters";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [product, setProduct] = useState<UiProduct | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const [listing, cats] = await Promise.all([
          getListingById(params.id),
          getCategories(),
        ]);

        const map: Record<number, string> = {};
        cats.forEach((c) => (map[c.id] = c.name));

        const ui = listingToUiProduct(listing, listing.category_id ? map[listing.category_id] : undefined);
        if (!mounted) return;

        setProduct(ui);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "No se pudo cargar la publicación.";
        if (!mounted) return;
        setErrorMsg(msg);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [params.id]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8">Cargando…</div>;
  if (errorMsg) return <div className="mx-auto max-w-4xl px-4 py-8">{errorMsg}</div>;
  if (!product) return <div className="mx-auto max-w-4xl px-4 py-8">No encontrado.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button className="text-sm underline" onClick={() => router.back()}>
        Volver
      </button>

      <h1 className="mt-4 text-2xl font-semibold">{product.title}</h1>
      <p className="mt-2 text-sm text-gray-600">{product.category} • {product.location}</p>

      <p className="mt-4 text-xl font-semibold">DOP {product.price.toLocaleString()}</p>

      {product.description ? (
        <p className="mt-4 text-sm text-gray-700">{product.description}</p>
      ) : null}
    </div>
  );
}