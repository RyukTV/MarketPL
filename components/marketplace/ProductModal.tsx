/* eslint-disable @next/next/no-img-element */
import { Product } from "../../lib/mockProducts";
import { IconMapPin, IconUser, IconX } from "../shared/icons";

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-y-auto rounded-lg bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3">
          <h2 className="text-lg font-semibold">Detalle del producto</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <img
              src={product.image}
              alt={product.title}
              className="w-full rounded-lg"
            />
          </div>

          <div>
            <div className="mb-4 text-3xl font-bold">
              ${product.price.toLocaleString()}
            </div>
            <h3 className="mb-4 text-2xl">{product.title}</h3>

            <div className="mb-6 flex items-center text-gray-600">
              <IconMapPin className="mr-2 h-5 w-5" />
              {product.location}
            </div>

            <div className="border-t pt-6">
              <h4 className="mb-3 font-semibold">Información del vendedor</h4>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <IconUser className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">Vendedor (demo)</div>
                  <div className="text-sm text-gray-500">
                    Miembro desde 2024
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="w-full rounded-lg bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700"
              >
                Contactar (demo)
              </button>
              <p className="text-xs text-gray-500">
                Nota: luego conectaremos WhatsApp / Supabase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
