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
})

{
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

export async function getActiveListings() {
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      listing_images (
        path,
        sort_order
      )
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "listing_images", ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * READ: Traer 1 publicación por id (Detalle)
 */
export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Listing;
}

/**
 * READ: Traer publicaciones del usuario logueado (Mis publicaciones)
 */
export async function getMyListings() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("Debes iniciar sesión.");

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      listing_images (
        path,
        sort_order
      )
    `
    )
    .eq("seller_id", userId)
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "listing_images", ascending: true });

  if (error) throw error;
  return (data ?? []) as Listing[];
}

/**
 * delete: Elimina la publicacion en la base de datos.
 */
export async function deleteListing(id: string) {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}

const IMAGES_BUCKET = "listing-images";
export async function uploadListingImages(params: {
  userId: string;
  listingId: string;
  files: File[];
}) {
  const { userId, listingId, files } = params;

  const paths: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // extensión (jpg/png) y nombre único simple
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const fileName = `${Date.now()}-${i}.${ext}`;

    // Ruta recomendada: <userId>/<listingId>/<file>
    const path = `${userId}/${listingId}/${fileName}`;

    const { error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (error) throw error;

    paths.push(path);
  }

  return paths;
}

/**
 * Inserta en listing_images las rutas subidas.
 */
export async function insertListingImages(params: {
  listingId: string;
  paths: string[];
}) {
  if (params.paths.length === 0) return;

  const rows = params.paths.map((path, idx) => ({
    listing_id: params.listingId,
    path,
    sort_order: idx,
  }));

  const { error } = await supabase.from("listing_images").insert(rows);
  if (error) throw error;
}

/**
 * Devuelve la URL pública (porque el bucket es PUBLIC).
 */
export function getListingImagePublicUrl(path: string) {
  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function getListingSellerContact(listingId: string) {
  type SellerProfileRow = {
    full_name: string | null;
    username: string | null;
    phone: string | null;
    avatar_url: string | null;
  };

  type ListingSellerRow = {
    seller_id: string;
    profiles: SellerProfileRow | null;
  };

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      seller_id,
      profiles:profiles (
        full_name,
        username,
        phone,
        avatar_url
      )
    `
    )
    .eq("id", listingId)
    .single<ListingSellerRow>();

  if (error) throw error;

  const profile = data.profiles;

  return {
    sellerId: data.seller_id,
    fullName: profile?.full_name ?? null,
    username: profile?.username ?? null,
    phone: profile?.phone ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
}


//Update
export async function updateListing(params: {
  id: string;
  title: string;
  description?: string;
  price: number;
  city?: string;
  category_id?: number | null;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("Debes iniciar sesión.");

  const { data, error } = await supabase
    .from("listings")
    .update({
      title: params.title.trim(),
      description: params.description?.trim() || null,
      price: params.price,
      city: params.city?.trim() || null,
      category_id: params.category_id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}


export async function setListingMainImage(params: {
  listingId: string;
  file: File;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("Debes iniciar sesión.");

  // 1) Subir el archivo al bucket (reusamos tu uploader)
  const [path] = await uploadListingImages({
    userId,
    listingId: params.listingId,
    files: [params.file],
  });

  // 2) Ver si ya existe imagen principal (sort_order = 0)
  const { data: existing, error: readErr } = await supabase
    .from("listing_images")
    .select("id")
    .eq("listing_id", params.listingId)
    .eq("sort_order", 0)
    .maybeSingle();

  if (readErr) throw readErr;

  // 3) Si existe: update. Si no: insert.
  if (existing?.id) {
    const { error } = await supabase
      .from("listing_images")
      .update({ path })
      .eq("id", existing.id);

    if (error) throw error;
  } else {
    const { error } = await supabase.from("listing_images").insert({
      listing_id: params.listingId,
      path,
      sort_order: 0,
    });

    if (error) throw error;
  }

  // 4) Devolver URL pública para preview inmediato
  return getListingImagePublicUrl(path);
}