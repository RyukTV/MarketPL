/* eslint-disable @next/next/no-img-element */
import { Product } from "../../lib/mockProducts";
import { IconMapPin } from "../shared/icons";

type ProductCardProps = {
  product: Product;
  onClick: () => void;
};

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-square bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        {/* ✅ más notorio */}
        <div className="mb-1 text-xl font-extrabold text-gray-900">
          DOP {product.price.toLocaleString()}
        </div>

        {/* ✅ más notorio */}
        <div className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">
          {product.title}
        </div>

        {/* ✅ más notorio */}
        <div className="flex items-center text-xs font-medium text-gray-700">
          <IconMapPin className="mr-1 h-3 w-3" />
          {product.location}
        </div>
      </div>
    </div>
  );
}