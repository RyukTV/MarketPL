/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Product } from "../../lib/mockProducts";
import { IconMapPin, IconUser, IconX } from "../shared/icons";
import { getListingSellerContact } from "@/features/listings/listings.service";

type SellerInfo = {
  fullName: string | null;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;
};

type ProductModalProps = {
  product: Product | null;
  listingUuid: string | null; // ✅ nuevo
  onClose: () => void;
};

function buildWhatsAppLink(phone: string, title: string) {
  // deja solo números y opcional +
  const cleaned = phone.replace(/[^\d+]/g, "");
  const digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

  const text = encodeURIComponent(`Hola, estoy interesado en: ${title}`);
  return `https://wa.me/${digits}?text=${text}`;
}

export default function ProductModal({
  product,
  listingUuid,
  onClose,
}: ProductModalProps) {
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [sellerError, setSellerError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSeller() {
      setSeller(null);
      setSellerError(null);

      if (!listingUuid) return;

      try {
        const data = await getListingSellerContact(listingUuid);
        if (!mounted) return;

        setSeller({
          fullName: data.fullName,
          username: data.username,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
        });
      } catch (err: unknown) {
        if (!mounted) return;
        const msg =
          err instanceof Error ? err.message : "No se pudo cargar el vendedor.";
        setSellerError(msg);
      }
    }

    loadSeller();
    return () => {
      mounted = false;
    };
  }, [listingUuid]);

  if (!product) return null;

  const sellerName =
    seller?.fullName ?? seller?.username ?? (sellerError ? "Vendedor" : "Cargando...");
  const hasPhone = !!seller?.phone;

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
          <h2 className="text-lg font-semibold text-gray-900">
            Detalle del producto
          </h2>
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
            {/* ✅ más notorio */}
            <div className="mb-3 text-3xl font-extrabold text-gray-900">
              DOP {product.price.toLocaleString()}
            </div>

            {/* ✅ más notorio */}
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              {product.title}
            </h3>

            {/* ✅ más notorio */}
            <div className="mb-6 flex items-center font-medium text-gray-800">
              <IconMapPin className="mr-2 h-5 w-5" />
              {product.location}
            </div>

            <div className="border-t pt-6">
              <h4 className="mb-3 font-semibold text-gray-900">
                Información del vendedor
              </h4>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                  {seller?.avatarUrl ? (
                    <img
                      src={seller.avatarUrl}
                      alt="Avatar vendedor"
                      className="h-12 w-12 object-cover"
                    />
                  ) : (
                    <IconUser className="h-6 w-6 text-gray-600" />
                  )}
                </div>

                <div>
                  <div className="font-semibold text-gray-900">{sellerName}</div>
                  <div className="text-sm text-gray-700">
                    {seller?.phone ? seller.phone : "Sin WhatsApp registrado"}
                  </div>
                  {sellerError ? (
                    <div className="text-xs text-red-600">{sellerError}</div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={!hasPhone}
                onClick={() => {
                  if (!seller?.phone) return;
                  window.open(
                    buildWhatsAppLink(seller.phone, product.title),
                    "_blank"
                  );
                }}
                className="w-full rounded-lg bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {hasPhone ? "Contactar por WhatsApp" : "WhatsApp no disponible"}
              </button>

              <p className="text-xs text-gray-600">
                Se abrirá WhatsApp con un mensaje listo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}