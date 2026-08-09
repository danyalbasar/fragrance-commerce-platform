"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { WishlistItem } from "@/types/wishlist";
import { formatPrice } from "@/utils/format";
import {
    addToCart,
    getCart,
    updateCartItem,
} from "@/services/cartService";

interface WishlistCardProps {
    item: WishlistItem;
    onRemove: (productId: string) => Promise<void>;
}

export default function WishlistCard({ item, onRemove }: WishlistCardProps) {
    const [quantity, setQuantity] = useState(0);
    const [cartItemId, setCartItemId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const lowStock = item.stockQuantity > 0 && item.stockQuantity <= 2;

    async function loadCartItem() {
        try {
            const cart = await getCart();

            const existingItem = cart.items.find(
                (cartItem) => cartItem.productVariantId === item.variantId
            );

            if (existingItem) {
                setQuantity(existingItem.quantity);
                setCartItemId(existingItem.id);
            } else {
                setQuantity(0);
                setCartItemId(null);
            }
        } catch {
            setQuantity(0);
            setCartItemId(null);
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(loadCartItem, 0);

        window.addEventListener("cartUpdated", loadCartItem);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("cartUpdated", loadCartItem);
        };
    }, [item.variantId]);

    async function handleQuickAdd(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();

        if (!item.variantId || item.stockQuantity <= 0) return;
        if (quantity >= item.stockQuantity) return;

        try {
            setLoading(true);

            if (cartItemId) {
                await updateCartItem(cartItemId, quantity + 1);
            } else {
                await addToCart(item.variantId, 1);
            }

            await onRemove(item.productId);
            window.dispatchEvent(new Event("cartUpdated"));
            window.dispatchEvent(new Event("wishlistUpdated"));
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();

        try {
            setRemoving(true);
            await onRemove(item.productId);
        } finally {
            setRemoving(false);
        }
    }

    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--luxury-gold)] hover:shadow-[var(--luxury-shadow-md)] active:scale-[0.99]">
            <div className="relative aspect-square overflow-hidden bg-[var(--luxury-sand)]">
                <div className="absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--luxury-gold),transparent)]" />

                <Link
                    href={`/products/${item.productId}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0"
                >
                    {item.primaryImageUrl && (
                        <Image
                            src={item.primaryImageUrl}
                            alt=""
                            fill
                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                        />
                    )}
                </Link>

                <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="absolute right-4 top-4 z-10 rounded-full border border-[#e0b8ad] bg-[rgba(255,250,242,0.95)] p-2 text-red-600 opacity-100 shadow-[0_12px_30px_rgba(22,18,13,0.16)] backdrop-blur-md transition-all duration-200 ease-out hover:border-red-300 hover:text-red-700 hover:scale-110 active:scale-90 disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                    aria-label={`Remove ${item.productName} from wishlist`}
                >
                    <Trash2 size={18} className="transition-all duration-200 hover:text-red-700" />
                </button>

                <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-0 opacity-100 transition-all duration-300 md:inset-x-6 md:bottom-5 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
                    <button
                        onClick={handleQuickAdd}
                        disabled={loading || item.stockQuantity <= 0}
                        className="pointer-events-auto mx-auto flex h-11 w-full max-w-[300px] items-center justify-center rounded-[var(--luxury-radius)] bg-[var(--luxury-paper)] text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-ink)] shadow-[0_16px_35px_rgba(22,18,13,0.16)] transition-all duration-200 hover:bg-[var(--luxury-ink)] hover:text-[var(--luxury-paper)] hover:shadow-[0_20px_40px_rgba(22,18,13,0.24)] active:scale-[0.98] disabled:bg-[#e5ddd0] disabled:text-[var(--luxury-muted-strong)]"
                    >
                        {loading ? "Adding..." : "+ Quick Add"}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <Link href={`/products/${item.productId}`} className="block">
                    <p className="text-xs uppercase tracking-[0.28em] text-[var(--luxury-gold-strong)]">
                        {item.brandName}
                    </p>

                    <h3 className="mt-2 text-xl font-normal leading-[1.08] [font-family:var(--font-serif)] sm:text-2xl">
                        {item.productName}
                    </h3>
                </Link>

                <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                    {item.gender} &#8226; {item.categoryName} &#8226;{" "}
                    {item.variantName}
                </p>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--luxury-muted)]">
                    {item.description}
                </p>

                <div className="mt-auto pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-2xl font-semibold">
                            {formatPrice(item.sellingPrice)}
                        </span>

                        {lowStock && (
                            <span className="rounded-full border border-[#d7ad62] bg-[#fff6e4] px-3 py-1 text-xs font-medium text-[#8a5a12]">
                                Only {item.stockQuantity} left
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
