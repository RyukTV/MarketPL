import type { Listing } from "./types";

/**
 * Modelo mínimo para reutilizar tus componentes actuales (ProductCard/ProductModal)
 * sin reescribir todo el UI ahora.
 */
export type UiProduct = {
  id: string;
  title: string;
  price: number;
  category: string;   // nombre
  location: string;   // ciudad
  image: string;      // placeholder por ahora
  description?: string;
};

export function listingToUiProduct(
  listing: Listing,
  categoryName?: string,
  imageUrl?: string
): UiProduct {
  return {
    id: listing.id,
    title: listing.title,
    price: Number(listing.price),
    category: categoryName ?? "Otros",
    location: listing.city ?? "Santo Domingo",
    image: imageUrl ?? "/placeholder.png",
    description: listing.description ?? "",
  };
}