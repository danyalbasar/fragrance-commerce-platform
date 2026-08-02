"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { WishlistItem } from "@/types/wishlist";
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
        loadCartItem();

        window.addEventListener("cartUpdated", loadCartItem);

        return () => {
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
        <Link
            href={`/products/${item.productId}`}
            className="group flex h-full flex-col overflow-hidden border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--luxury-gold)] hover:shadow-[0_26px_70px_rgba(22,18,13,0.16)]"
        >
            <div className="relative aspect-square overflow-hidden bg-[#efe3d0]">
                <div className="absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--luxury-gold),transparent)]" />

                <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="absolute right-4 top-4 z-10 rounded-full border border-[#e0b8ad] bg-[rgba(255,250,242,0.9)] p-2 text-red-600 opacity-0 shadow-[0_10px_24px_rgba(22,18,13,0.14)] backdrop-blur-sm transition-all duration-300 hover:border-red-300 hover:text-red-700 disabled:opacity-50 group-hover:opacity-100 group-focus-within:opacity-100"
                    aria-label={`Remove ${item.productName} from wishlist`}
                >
                    <Trash2 size={18} />
                </button>

                {item.primaryImageUrl && (
                    <Image
                        src={item.primaryImageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                )}

                <div className="pointer-events-none absolute inset-x-6 bottom-5 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={handleQuickAdd}
                        disabled={loading || item.stockQuantity <= 0}
                        className="pointer-events-auto mx-auto flex h-11 w-full max-w-[300px] items-center justify-center bg-[var(--luxury-paper)] text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-ink)] shadow-[0_16px_35px_rgba(22,18,13,0.16)] transition hover:bg-[var(--luxury-ink)] hover:text-[var(--luxury-paper)] disabled:bg-gray-200 disabled:text-gray-500"
                    >
                        {loading ? "Adding..." : "+ Quick Add"}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--luxury-gold)]">
                    {item.brandName}
                </p>

                <h3 className="mt-2 text-2xl font-normal leading-tight [font-family:var(--font-serif)]">
                    {item.productName}
                </h3>

                <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                    {item.gender} &#8226; {item.categoryName} &#8226;{" "}
                    {item.variantName}
                </p>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--luxury-muted)]">
                    {item.description}
                </p>

                <div className="mt-auto pt-5">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-semibold">
                            &#8377;{item.sellingPrice}
                        </span>

                        {lowStock && (
                            <span className="rounded-full border border-[#d7ad62] bg-[#fff6e4] px-3 py-1 text-xs font-medium text-[#8a5a12]">
                                Only {item.stockQuantity} left
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
