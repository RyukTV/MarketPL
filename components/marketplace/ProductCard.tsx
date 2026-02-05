<<<<<<< HEAD
/* eslint-disable @next/next/no-img-element */
=======
>>>>>>> origin/main
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
        <div className="mb-1 text-xl font-semibold">
          ${product.price.toLocaleString()}
        </div>
        <div className="mb-2 line-clamp-2 text-sm text-gray-700">
          {product.title}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <IconMapPin className="mr-1 h-3 w-3" />
          {product.location}
        </div>
      </div>
    </div>
  );
}
