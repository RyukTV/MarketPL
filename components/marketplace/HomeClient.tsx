"use client";

import { useMemo, useState } from "react";
import CategoryFilter from "./CategoryFilter";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { categories, mockProducts, Product } from "../../lib/mockProducts";
import { IconPlus, IconSearch } from "../shared/icons";
import Link from "next/link";

export default function HomeClient() {
  // Estado del producto seleccionado (para abrir/cerrar el modal de detalle)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Categoría seleccionada para filtrar el listado
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Calcula la lista de productos a mostrar según categoría + texto de búsqueda
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = q.length === 0 || product.title.toLowerCase().includes(q) || product.location.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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
                className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <IconPlus className="h-5 w-5" />
            <span>Publicar</span>
          </Link>
        </div>
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </main>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
