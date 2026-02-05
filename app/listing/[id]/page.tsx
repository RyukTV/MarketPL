import Link from "next/link";
import { mockProducts } from "../../../lib/mockProducts";

export default function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Volver
      </Link>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <img
          src={product.image}
          alt={product.title}
          className="w-full rounded-lg"
        />
        <div>
          <div className="text-3xl font-bold">${product.price.toLocaleString()}</div>
          <h1 className="mt-2 text-2xl">{product.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{product.location}</p>
          <p className="mt-6 text-sm text-gray-500">
            Vista de detalle (demo). Para el primer parcial usamos datos mock; luego se conectará a Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
