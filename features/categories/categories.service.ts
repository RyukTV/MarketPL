import { supabase } from "@/lib/supabase/client";
import type { Category } from "./types";

/**
 * READ: Traer todas las categorías
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}