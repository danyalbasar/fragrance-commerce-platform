"use client";

import { useState } from "react";
import type { ProductVariant } from "@/types/product";
import { addToCart } from "@/services/cartService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface VariantSelectorProps {
  variants: ProductVariant[];
}

export default function VariantSelector({ variants }: VariantSelectorProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [isAdding, setIsAdding] = useState(false);
  const lowStock =
    selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= 2;

  async function handleAddToCart() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      setIsAdding(true);

      await addToCart(selectedVariant.id, 1);

      alert("Added to cart");
    } catch (error) {
      console.error(error);
      alert("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Available Variants</h2>

      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => setSelectedVariant(variant)}
            className={`rounded-full border px-5 py-2 text-sm font-medium ${selectedVariant.id === variant.id
              ? "bg-black text-white"
              : "bg-white text-black"
              }`}
          >
            {variant.variantName}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-3xl font-bold">
          ₹{selectedVariant.sellingPrice}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          SKU: {selectedVariant.sku}
        </p>

        {lowStock && (
          <p className="mt-3 inline-flex rounded-full border border-[#d7ad62] bg-[#fff6e4] px-3 py-1 text-xs font-medium text-[#8a5a12]">
            Only {selectedVariant.stockQuantity} left
          </p>
        )}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isAdding || selectedVariant.stockQuantity <= 0}
        className="mt-10 w-full rounded-full bg-black px-8 py-4 font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}
