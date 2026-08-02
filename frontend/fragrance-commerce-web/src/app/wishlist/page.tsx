"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import WishlistCard from "@/components/products/WishlistCard";
import type { Wishlist } from "@/types/wishlist";
import {
    getWishlist,
    removeFromWishlist,
} from "@/services/wishlistService";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<Wishlist | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadWishlist() {
        try {
            setLoading(true);
            const data = await getWishlist();
            setWishlist(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWishlist();

        window.addEventListener("wishlistUpdated", loadWishlist);

        return () => {
            window.removeEventListener("wishlistUpdated", loadWishlist);
        };
    }, []);

    async function handleRemove(productId: string) {
        await removeFromWishlist(productId);
        await loadWishlist();
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-6 py-10 text-[var(--luxury-ink)]">
                <div className="mx-auto max-w-7xl">
                    <div className="border-b border-[#d8c8ad] pb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
                            Saved Favorites
                        </p>

                        <h1 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">
                            My Wishlist
                        </h1>
                    </div>

                    {loading ? (
                        <p className="mt-8 text-sm uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                            Loading wishlist...
                        </p>
                    ) : wishlist?.items.length === 0 ? (
                        <div className="mt-8 border border-[#d8c8ad] bg-[var(--luxury-paper)] p-10 text-center shadow-[0_18px_45px_rgba(22,18,13,0.06)]">
                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                Your wishlist is empty
                            </h2>

                            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                Save the fragrances and beauty essentials you want to revisit.
                            </p>

                            <Link
                                href="/products"
                                className="mt-6 inline-block rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)]"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                            {wishlist?.items.map((item) => (
                                <WishlistCard
                                    key={item.id}
                                    item={item}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}
