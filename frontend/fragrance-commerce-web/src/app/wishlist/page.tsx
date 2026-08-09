"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { WishlistPageSkeleton } from "@/components/common/WishlistPageSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import WishlistCard from "@/components/products/WishlistCard";
import type { Wishlist } from "@/types/wishlist";
import {
    getWishlist,
    removeFromWishlist,
} from "@/services/wishlistService";
import { readCache, writeCache } from "@/utils/swrCache";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<Wishlist | null>(() =>
        readCache<Wishlist>("wishlist")
    );
    const [loading, setLoading] = useState(wishlist === null);

    async function loadWishlist() {
        try {
            setLoading(true);
            const data = await getWishlist();
            setWishlist(data);
            writeCache("wishlist", data);
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

    if (loading && !wishlist) {
        return (
            <ProtectedRoute>
                <WishlistPageSkeleton />
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 border-b border-[#d8c8ad] pb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                            Saved Favorites
                        </p>

                        <h1 className="mt-3 text-4xl font-normal leading-[1.05] [font-family:var(--font-serif)] sm:text-5xl">
                            My Wishlist
                        </h1>
                    </div>

                    {wishlist?.items.length === 0 ? (
                        <EmptyState
                            icon={Heart}
                            title="Your wishlist is empty"
                            description="Save the fragrances and beauty essentials you want to revisit."
                            actionLabel="Browse Products"
                            actionHref="/products"
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
