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
  const [errorMessage, setErrorMessage] = useState("");
  const lowStock =
    selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= 2;

  async function handleAddToCart() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      setIsAdding(true);
      setErrorMessage("");

      await addToCart(selectedVariant.id, 1);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-6 shadow-[var(--luxury-shadow-md)]">
      <h2 className="mb-4 text-lg font-semibold [font-family:var(--font-serif)]">Available Variants</h2>

      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => setSelectedVariant(variant)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition-all duration-300 ease-out ${selectedVariant.id === variant.id
              ? "border-[var(--luxury-ink)] bg-[var(--luxury-ink)] text-[var(--luxury-paper)] shadow-[0_8px_20px_rgba(22,18,13,0.08)]"
              : "border-[var(--luxury-line)] bg-[var(--luxury-paper)] text-[var(--luxury-ink)] hover:border-[var(--luxury-gold)] hover:shadow-[0_8px_20px_rgba(22,18,13,0.06)]"
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

        <p className="mt-2 text-sm text-[var(--luxury-muted)]">
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
        className="mt-10 w-full rounded-full bg-[var(--luxury-ink)] px-8 py-4 font-semibold text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition-all duration-300 ease-out hover:bg-[var(--luxury-moss)] hover:shadow-[0_18px_38px_rgba(22,18,13,0.16)] disabled:cursor-not-allowed disabled:bg-[var(--luxury-muted-strong)] disabled:shadow-none"
      >
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>

      {errorMessage && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}