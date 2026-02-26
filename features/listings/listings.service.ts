import { supabase } from "@/lib/supabase/client";
import type { Listing } from "./types";

/**
 * CREATE: Crea una publicación en la tabla "listings".
 * Reglas:
 * - Debe existir sesión (usuario logueado)
 * - seller_id = user.id (esto lo exige RLS normalmente)
 * - status inicia como "active"
 */
export async function createListing(input: {
  title: string;
  description?: string;
  price: number;
  city?: string;
  category_id?: number | null;
}) {
  // 1) Tomar sesión actual
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) throw sessionError;

  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("Debes iniciar sesión para publicar.");

  // 2) Insertar en DB
  const { data, error } = await supabase
    .from("listings")
    .insert({
      seller_id: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      currency: "DOP",
      city: input.city?.trim() || null,
      category_id: input.category_id ?? null,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as Listing;
}