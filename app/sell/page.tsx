"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  createListing,
  uploadListingImages,
  insertListingImages,
} from "@/features/listings/listings.service";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`${label} tardó demasiado.`)),
      ms
    );

    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export default function SellPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (!data.session) {
        router.replace("/auth");
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
  const [files, setFiles] = useState<File[]>([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setStep(null);

    try {
      // Validaciones mínimas
      if (!title.trim()) throw new Error("El título es obligatorio.");
      if (price === "" || price <= 0)
        throw new Error("El precio debe ser mayor que 0.");

      // Validaciones de fotos (evita colgados por archivos enormes)
      if (files.length > 5) throw new Error("Máximo 5 fotos por publicación.");
      for (const f of files) {
        if (f.size > 5 * 1024 * 1024) {
          throw new Error("Cada foto debe ser menor de 5MB.");
        }
      }

      console.log("STEP 1: creating listing...");
      setStep("Creando publicación...");

      // 1) Crear listing
      const created = await createListing({
        title: title.trim(),
        description: description.trim() || undefined,
        price,
        city: city || undefined,
        category_id: categoryId === "" ? null : categoryId,
      });

      console.log("STEP 2: listing created:", created.id);
      setStep("Publicación creada ✅");

      // 2) Obtener userId (para ruta del bucket)
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("Debes iniciar sesión para subir fotos.");

      // 3) Subir imágenes y guardarlas en listing_images
      if (files.length > 0) {
        console.log("STEP 3: uploading files:", files.length);
        setStep("Subiendo fotos...");

        const paths = await withTimeout(
          uploadListingImages({
            userId,
            listingId: created.id,
            files,
          }),
          30000,
          "La subida de imágenes"
        );

        console.log("STEP 4: uploaded paths:", paths);
        setStep("Guardando fotos en base de datos...");

        await withTimeout(
          insertListingImages({
            listingId: created.id,
            paths,
          }),
          15000,
          "Guardar fotos en base de datos"
        );

        console.log("STEP 5: images inserted");
      }

      setStep("Listo ✅");
      setMessage("Publicado ✅");
      router.push("/my-listings");
    } catch (err: unknown) {
      console.log("SELL CREATE ERROR:", err);
      const msg = err instanceof Error ? err.message : "No se pudo publicar.";
      setMessage(msg);
      setStep(null);
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
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
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

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Se guarda el número (ID) para enviarlo a la base de datos.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Fotos</label>
          <input
            type="file"
            accept="image/png,image/jpg,image/jpeg"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="mt-1 block w-full text-sm"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Puedes subir varias fotos (jpg/png). La primera será la principal.
          </p>
        </div>

        {step && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{step}</p>
        )}

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