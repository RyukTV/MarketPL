"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/features/listings/listings.service";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";


export default function SellPage() {
  const router = useRouter();

  useEffect(() => {
  let mounted = true;

  supabase.auth.getSession().then(({ data }) => {
    if (!mounted) return;

    if (!data.session) {
      router.push("/auth");
      router.refresh();
    }
  });

  return () => {
    mounted = false;
  };
}, [router]);



  // Campos
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");

  // UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validaciones mínimas (para evitar basura en BD)
      if (!title.trim()) throw new Error("El título es obligatorio.");
      if (price === "" || price <= 0) throw new Error("El precio debe ser mayor que 0.");

      await createListing({
        title: title.trim(),
        description: description.trim() || undefined,
        price,
        city: city || undefined,
        category_id: categoryId === "" ? null : categoryId,
      });

      setMessage("Publicado ✅");
      router.push("/my-listings"); // o "/" si prefieren
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo publicar.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Publicar producto</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Completa los datos para crear una publicación.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm">Título *</label>
          <input
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: iPhone 11 64GB"
            required
          />
        </div>

        <div>
          <label className="text-sm">Descripción</label>
          <textarea
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles del producto..."
            rows={4}
          />
        </div>

    <div>
  <label className="text-sm">Precio (DOP) *</label>

  <div className="mt-1 flex items-center gap-2">
    <span className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
      DOP
    </span>

    <input
      className="w-full rounded-lg border bg-white px-3 py-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      type="number"
      value={price}
      onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
      min={1}
      required
      placeholder="0"
    />
  </div>

  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
    Escribe solo números. Ej: 1500
  </p>
</div>

      <div>
  <label className="text-sm">Ciudad</label>
  <select
    className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
    value={city}
    onChange={(e) => setCity(e.target.value)}
  >
    <option value="">Selecciona una ciudad</option>
    <option value="Santo Domingo">Santo Domingo</option>
    <option value="Los Mina">Los Mina</option>
    <option value="Barahona">Barahona</option>
  </select>
</div>

    <div>
  <label className="text-sm">Categoría</label>
  <select
    className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
    value={categoryId}
    onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
  >
    <option value="">Selecciona una categoría</option>
    <option value="1">1 - Electrónica</option>
    <option value="2">2 - Hogar</option>
    <option value="3">3 - Ropa</option>
    <option value="4">4 - Servicios</option>
    <option value="5">5 - Otros</option>
  </select>

  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
    Se guarda el número (ID) para enviarlo a la base de datos.
  </p>
</div>

        <button
          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>

        {message && (
          <p className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}