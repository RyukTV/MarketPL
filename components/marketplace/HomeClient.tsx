"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import CategoryFilter from "./CategoryFilter";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { IconPlus, IconSearch } from "../shared/icons";

import type { Product } from "../../lib/mockProducts";

import {
  getActiveListings,
  getListingImagePublicUrl,
} from "@/features/listings/listings.service";
import { getCategories } from "@/features/categories/categories.service";

function uuidToNumber(uuid: string) {
  const hex = uuid.replace(/-/g, "").slice(0, 8);
  return parseInt(hex, 16);
}

type ListingImageRow = {
  path: string;
  sort_order: number | null;
};

type ListingRowWithImages = {
  id: string;
  title: string;
  price: number | string;
  category_id: number | null;
  city: string | null;
  listing_images?: ListingImageRow[] | null;
};

export default function HomeClient() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedListingUuid, setSelectedListingUuid] = useState<string | null>(
    null
  );

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);

  // ✅ Map numId -> uuid real
  const [idMap, setIdMap] = useState<Record<number, string>>({});

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const cats = await getCategories();
        const categoryMap: Record<number, string> = {};
        cats.forEach((c) => (categoryMap[c.id] = c.name));

        const listings = await getActiveListings();

        const newMap: Record<number, string> = {};

        const adapted: Product[] = (listings as ListingRowWithImages[]).map(
          (l) => {
            const imgs = Array.isArray(l.listing_images)
              ? [...l.listing_images]
              : [];
            imgs.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

            const firstPath = imgs[0]?.path;
            const imageUrl = firstPath
              ? getListingImagePublicUrl(firstPath)
              : "/placeholder.png";

            const numId = uuidToNumber(l.id);
            newMap[numId] = l.id; // ✅ guardamos uuid real

            return {
              id: numId,
              title: l.title,
              price: Number(l.price),
              category: l.category_id
                ? categoryMap[l.category_id] ?? "Otros"
                : "Otros",
              location: l.city ?? "Santo Domingo",
              image: imageUrl,
            };
          }
        );

        if (!mounted) return;

        setIdMap(newMap);
        setCategories(["All", ...cats.map((c) => c.name)]);
        setProducts(adapted);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Error cargando publicaciones.";
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
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;

      const matchesSearch =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-2xl">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Busca productos o ubicaciones..."
                className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <IconPlus className="h-4 w-4" />
            Publicar
          </Link>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading && (
          <p className="mt-6 text-sm text-gray-600">Cargando publicaciones…</p>
        )}
        {errorMsg && <p className="mt-6 text-sm text-red-600">{errorMsg}</p>}

        {!loading && !errorMsg && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => {
                  setSelectedProduct(product);
                  setSelectedListingUuid(idMap[product.id] ?? null); // ✅ uuid real
                }}
              />
            ))}
          </div>
        )}

        <ProductModal
          product={selectedProduct}
          listingUuid={selectedListingUuid} // ✅ nuevo
          onClose={() => {
            setSelectedProduct(null);
            setSelectedListingUuid(null);
          }}
        />
      </main>
    </div>
  );
}