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

interface QuickAddBarProps {
    product: Product | null;
    onClose: () => void;
}

export default function QuickAddBar({ product, onClose }: QuickAddBarProps) {
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
                    {/* Overlay */}
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[90] bg-black/40"
                        onClick={onClose}
                    />

                    {/* Mobile: bottom sheet */}
                    <motion.div
                        key="bar-mobile"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="fixed inset-x-0 bottom-0 z-[95] md:hidden"
                    >
                        <div className="mx-auto flex max-w-lg flex-col rounded-t-2xl border-t border-[var(--luxury-line)] bg-[var(--luxury-paper)] px-6 pb-8 pt-5 shadow-[0_-20px_60px_rgba(22,18,13,0.18)]">
                            <BarContent
                                product={product}
                                selectedVariant={selectedVariant}
                                setSelectedVariant={setSelectedVariant}
                                primaryImage={primaryImage}
                                loading={loading}
                                inStock={inStock}
                                handleAddToCart={handleAddToCart}
                                onClose={onClose}
                            />
                        </div>
                    </motion.div>

                    {/* Desktop: centered modal */}
                    <motion.div
                        key="bar-desktop"
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="fixed left-1/2 top-1/2 z-[95] hidden w-full max-w-md -translate-x-1/2 -translate-y-1/2 md:block"
                    >
                        <div className="mx-6 flex flex-col rounded-2xl border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-7 shadow-[0_30px_80px_rgba(22,18,13,0.28)]">
                            <BarContent
                                product={product}
                                selectedVariant={selectedVariant}
                                setSelectedVariant={setSelectedVariant}
                                primaryImage={primaryImage}
                                loading={loading}
                                inStock={inStock}
                                handleAddToCart={handleAddToCart}
                                onClose={onClose}
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function BarContent({
    product,
    selectedVariant,
    setSelectedVariant,
    primaryImage,
    loading,
    inStock,
    handleAddToCart,
    onClose,
}: {
    product: Product;
    selectedVariant: ProductVariant | null;
    setSelectedVariant: (v: ProductVariant) => void;
    primaryImage: string | undefined;
    loading: boolean;
    inStock: boolean | undefined;
    handleAddToCart: () => void;
    onClose: () => void;
}) {
    return (
        <>
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

            <div className="flex gap-5">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--luxury-line)] bg-[var(--luxury-sand)]">
                    {primaryImage && (
                        <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                        />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--luxury-gold-strong)]">
                        {product.brandName}
                    </p>

                    <h3 className="mt-1 line-clamp-1 text-base font-normal [font-family:var(--font-serif)]">
                        {product.name}
                    </h3>

                    <p className="mt-1.5 text-base font-semibold">
                        {formatPrice(selectedVariant?.sellingPrice)}
                    </p>
                </div>
            </div>

            {product.variants.length > 1 && (
                <div className="mt-5">
                    <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-[var(--luxury-muted)]">
                        Variant
                    </label>

                    <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => (
                            <button
                                key={variant.id}
                                type="button"
                                onClick={() => setSelectedVariant(variant)}
                                disabled={variant.stockQuantity <= 0}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150 ${
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
                className="mt-5 flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-[var(--luxury-ink)] text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition hover:bg-[var(--luxury-moss)] active:scale-[0.98] disabled:opacity-40"
            >
                <ShoppingBag size={18} />
                {loading
                    ? "Adding..."
                    : !inStock
                        ? "Out of Stock"
                        : "Add to Cart"}
            </button>
        </>
    );
}
