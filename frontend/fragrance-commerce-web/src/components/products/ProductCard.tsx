import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const primaryImage =
        product.images.find((i) => i.isPrimary) ?? product.images[0];

    const lowestPrice = Math.min(
        ...product.variants.map((v) => v.sellingPrice)
    );

    return (
        <Link
            href={`/products/${product.id}`}
            className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg"
        >
            {primaryImage && (
                <div className="relative h-72 w-full bg-gray-50">
                    <Image
                        src={primaryImage.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain"
                    />
                </div>
            )}

            <div className="p-5">
                <p className="text-sm text-gray-500">{product.brandName}</p>

                <h2 className="mt-1 text-xl font-semibold">{product.name}</h2>

                <p className="mt-3 line-clamp-2 text-gray-600">
                    {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold">₹{lowestPrice}</span>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        In Stock
                    </span>
                </div>
            </div>
        </Link>
    );
}