"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { addToCart } from "@/services/cartService";
import { formatPrice } from "@/utils/format";
import { useAuth } from "@/contexts/AuthContext";
import type { Product, ProductVariant } from "@/types/product";

interface MobileQuickAddBarProps {
    product: Product | null;
    onClose: () => void;
}

export default function MobileQuickAddBar({ product, onClose }: MobileQuickAddBarProps) {
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            const inStock = product.variants.find((v) => v.stockQuantity > 0);
            setSelectedVariant(inStock || product.variants[0] || null);
        }
    }, [product]);

    const primaryImage =
        product?.images.find((img) => img.isPrimary)?.imageUrl ||
        product?.images[0]?.imageUrl ||
        selectedVariant?.images[0]?.imageUrl;

    async function handleAddToCart() {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        if (!selectedVariant || selectedVariant.stockQuantity <= 0) return;

        try {
            setLoading(true);
            await addToCart(selectedVariant.id, 1);
            window.dispatchEvent(new Event("openCartPreview"));
            onClose();
        } finally {
            setLoading(false);
        }
    }

    const inStock = product?.variants.some((v) => v.stockQuantity > 0);

    return (
        <AnimatePresence>
            {product && (
                <>
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[90] bg-black/40 md:hidden"
                        onClick={onClose}
                    />

                    <motion.div
                        key="bar"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="fixed inset-x-0 bottom-0 z-[95] md:hidden"
                    >
                        <div className="mx-auto flex max-w-lg flex-col rounded-t-2xl border-t border-[var(--luxury-line)] bg-[var(--luxury-paper)] px-5 pb-8 pt-4 shadow-[0_-20px_60px_rgba(22,18,13,0.18)]">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">
                                    Quick Add
                                </p>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--luxury-sand)]"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--luxury-line)] bg-[var(--luxury-sand)]">
                                    {primaryImage && (
                                        <Image
                                            src={primaryImage}
                                            alt={product.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--luxury-gold-strong)]">
                                        {product.brandName}
                                    </p>

                                    <h3 className="mt-0.5 line-clamp-1 text-sm font-normal [font-family:var(--font-serif)]">
                                        {product.name}
                                    </h3>

                                    <p className="mt-1 text-sm font-semibold">
                                        {formatPrice(selectedVariant?.sellingPrice)}
                                    </p>
                                </div>
                            </div>

                            {product.variants.length > 1 && (
                                <div className="mt-4">
                                    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-[var(--luxury-muted)]">
                                        Variant
                                    </label>

                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((variant) => (
                                            <button
                                                key={variant.id}
                                                type="button"
                                                onClick={() => setSelectedVariant(variant)}
                                                disabled={variant.stockQuantity <= 0}
                                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                                                    selectedVariant?.id === variant.id
                                                        ? "border-[var(--luxury-ink)] bg-[var(--luxury-ink)] text-[var(--luxury-paper)]"
                                                        : "border-[#d8c8ad] text-[var(--luxury-ink)] hover:border-[var(--luxury-gold)]"
                                                } ${variant.stockQuantity <= 0 ? "opacity-40 line-through" : ""}`}
                                            >
                                                {variant.variantName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={loading || !inStock}
                                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--luxury-ink)] text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition hover:bg-[var(--luxury-moss)] active:scale-[0.98] disabled:opacity-40"
                            >
                                <ShoppingBag size={16} />
                                {loading
                                    ? "Adding..."
                                    : !inStock
                                        ? "Out of Stock"
                                        : "Add to Cart"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
