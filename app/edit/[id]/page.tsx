"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getListingById, updateListing } from "@/features/listings/listings.service";
import Image from "next/image";
import {
  getListingImagePublicUrl,
  setListingMainImage,
} from "@/features/listings/listings.service";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const listingId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Campos del form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");

  // ✅ Imagen principal (modo simple tipo perfil)
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

    // ✅ cargar imagen principal actual (sort_order = 0)
    async function loadMainImage(id: string) {
      const { data, error } = await supabase
        .from("listing_images")
        .select("path, sort_order")
        .eq("listing_id", id)
        .order("sort_order", { ascending: true });

      if (!mounted) return;

      if (error) {
        // si falla, no rompemos el edit
        setMainImageUrl(null);
        return;
      }

      const imgs = data ?? [];
      const main = imgs.find((x) => x.sort_order === 0) ?? imgs[0];
      setMainImageUrl(main?.path ? getListingImagePublicUrl(main.path) : null);
    }

    async function load() {
      if (!listingId) return;
      setLoading(true);
      setMessage(null);

      try {
        const ok = await guard();
        if (!ok) return;

        const listing = await getListingById(String(listingId));
        if (!mounted) return;

        setTitle(listing.title ?? "");
        setDescription(listing.description ?? "");
        setPrice(Number(listing.price) || "");
        setCity(listing.city ?? "");
        setCategoryId(listing.category_id ?? "");

        // ✅ cargar imagen principal para preview
        await loadMainImage(String(listingId));
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "No se pudo cargar la publicación.";
        if (!mounted) return;
        setMessage(msg);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [router, listingId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!title.trim()) throw new Error("El título es obligatorio.");
      if (price === "" || price <= 0)
        throw new Error("El precio debe ser mayor que 0.");

      await updateListing({
        id: String(listingId),
        title,
        description,
        price: Number(price),
        city: city || undefined,
        category_id: categoryId === "" ? null : Number(categoryId),
      });

      setMessage("Guardado ✅");
      router.push("/my-listings");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar.";
      setMessage(msg);
    } finally {
      setSaving(false);
    }
  }

  // ✅ subir/actualizar imagen principal
  async function onUpdateMainImage() {
    if (!listingId) return;

    if (!newImageFile) {
      setMessage("Selecciona una imagen primero.");
      return;
    }

    if (newImageFile.size > 5 * 1024 * 1024) {
      setMessage("La imagen debe ser menor de 5MB.");
      return;
    }

    setUploadingImage(true);
    setMessage(null);

    try {
      const url = await setListingMainImage({
        listingId: String(listingId),
        file: newImageFile,
      });

      setMainImageUrl(url);
      setNewImageFile(null);
      setMessage("Imagen actualizada ✅");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo subir la imagen.";
      setMessage(msg);
    } finally {
      setUploadingImage(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cargando publicación…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Editar publicación</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Actualiza los datos y guarda los cambios.
      </p>

      <form onSubmit={onSave} className="mt-6 space-y-4">
        {/* ✅ Imagen principal (simple, sin carrusel) */}
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Imagen principal
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <input
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Selecciona 1 imagen (jpg/png). Máx 5MB.
              </p>

              <button
                type="button"
                onClick={onUpdateMainImage}
                disabled={uploadingImage}
                className="mt-3 w-full rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {uploadingImage ? "Subiendo..." : "Subir / Actualizar imagen"}
              </button>
            </div>

            <div className="flex w-full justify-start sm:w-auto sm:justify-end">
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-950">
                {mainImageUrl ? (
                  <Image
                    src={mainImageUrl}
                    alt="Imagen principal"
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 dark:bg-gray-800" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm">Título *</label>
          <input
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm">Descripción</label>
          <textarea
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm">Precio (DOP) *</label>
          <input
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            type="number"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            min={1}
            required
          />
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
            onChange={(e) =>
              setCategoryId(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">Selecciona una categoría</option>
            <option value="1">1 - Electrónica</option>
            <option value="2">2 - Hogar</option>
            <option value="3">3 - Ropa</option>
            <option value="4">4 - Servicios</option>
            <option value="5">5 - Otros</option>
          </select>
        </div>

        {message && (
          <p className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700">
            {message}
          </p>
        )}

        <button
          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}