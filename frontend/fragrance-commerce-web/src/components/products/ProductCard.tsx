"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/types/product";
import { addToCart } from "@/services/cartService";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const primaryImage =
        product.images.find((image) => image.isPrimary)?.imageUrl ||
        product.images[0]?.imageUrl ||
        product.variants[0]?.images[0]?.imageUrl;

    const firstVariant = product.variants[0];

    async function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        if (!firstVariant) return;

        await addToCart(firstVariant.id, 1);
        alert("Added to cart.");
    }

    return (
        <Link
            href={`/products/${product.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
            <div className="relative h-80 overflow-hidden bg-neutral-100">
                <button
                    onClick={(e) => e.preventDefault()}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow-sm transition hover:bg-gray-100"
                >
                    <Heart size={18} />
                </button>

                {primaryImage && (
                    <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                    />
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                    {product.brandName}
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                    {product.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    {product.gender} • {product.categoryName} • {firstVariant?.variantName}
                </p>

                <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {product.description}
                </p>

                <div className="mt-auto pt-5">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                            ₹{firstVariant?.sellingPrice}
                        </span>

                        {firstVariant?.stockQuantity > 0 && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                                In Stock
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!firstVariant || firstVariant.stockQuantity <= 0}
                        className="mt-5 w-full rounded-full bg-black py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:bg-gray-300"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </Link>
    );
}