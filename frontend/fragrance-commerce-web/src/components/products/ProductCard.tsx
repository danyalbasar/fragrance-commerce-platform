"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { addToCart } from "@/services/cartService";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
} from "@/services/wishlistService";
import { useAuth } from "@/contexts/AuthContext";

interface ProductCardProps {
    product: Product;
    compactMobile?: boolean;
}

export default function ProductCard({ product, compactMobile = false }: ProductCardProps) {
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const primaryImage =
        product.images.find((image) => image.isPrimary)?.imageUrl ||
        product.images[0]?.imageUrl ||
        product.variants[0]?.images[0]?.imageUrl;

    const firstVariant = product.variants[0];
    const lowStock =
        firstVariant &&
        firstVariant.stockQuantity > 0 &&
        firstVariant.stockQuantity <= 2;

    async function loadWishlistStatus() {
        if (!isLoggedIn) {
            setIsWishlisted(false);
            return;
        }

        try {
            const wishlist = await getWishlist();

            const exists = wishlist.items.some(
                (item) => item.productId === product.id
            );

            setIsWishlisted(exists);
        } catch {
            setIsWishlisted(false);
        }
    }

    useEffect(() => {
        loadWishlistStatus();

        window.addEventListener("wishlistUpdated", loadWishlistStatus);

        return () => {
            window.removeEventListener("wishlistUpdated", loadWishlistStatus);
        };
    }, [isLoggedIn, product.id]);

    async function handleQuickAdd(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        if (!firstVariant || firstVariant.stockQuantity <= 0) return;

        try {
            setCartLoading(true);
            await addToCart(firstVariant.id, 1);
            window.dispatchEvent(new Event("openCartPreview"));
        } finally {
            setCartLoading(false);
        }
    }

    async function handleWishlistClick(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        try {
            setWishlistLoading(true);

            if (isWishlisted) {
                await removeFromWishlist(product.id);
                setIsWishlisted(false);
            } else {
                await addToWishlist(product.id);
                setIsWishlisted(true);
            }
        } finally {
            setWishlistLoading(false);
        }
    }

    return (
        <Link
            href={`/products/${product.id}`}
            className="group flex h-full flex-col overflow-hidden border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--luxury-gold)] hover:shadow-[0_26px_70px_rgba(22,18,13,0.16)]"
        >
            <div
                className={
                    compactMobile
                        ? "relative aspect-[1/1.08] overflow-hidden bg-[#efe3d0] md:aspect-square"
                        : "relative aspect-square overflow-hidden bg-[#efe3d0]"
                }
            >
                <div className="absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--luxury-gold),transparent)]" />
                <button
                    onClick={handleWishlistClick}
                    disabled={wishlistLoading}
                    className={`absolute right-3 top-3 z-10 rounded-full border border-[#d8c8ad] bg-[rgba(255,250,242,0.9)] p-2 text-[var(--luxury-ink)] shadow-[0_10px_24px_rgba(22,18,13,0.14)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] disabled:opacity-50 sm:right-4 sm:top-4 ${
                        isWishlisted
                            ? "translate-y-0 opacity-100"
                            : "translate-y-0 opacity-100 md:translate-y-[-6px] md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
                    }`}
                >
                    <Heart
                        size={18}
                        fill={isWishlisted ? "var(--luxury-gold)" : "none"}
                        className={isWishlisted ? "text-[var(--luxury-gold)]" : ""}
                    />
                </button>

                {primaryImage && (
                    <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                )}

                <div
                    className={
                        compactMobile
                            ? "pointer-events-none absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-all duration-300 md:inset-x-6 md:bottom-5 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
                            : "pointer-events-none absolute inset-x-4 bottom-4 translate-y-0 opacity-100 transition-all duration-300 md:inset-x-6 md:bottom-5 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
                    }
                >
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={handleQuickAdd}
                        disabled={
                            cartLoading ||
                            !firstVariant ||
                            firstVariant.stockQuantity <= 0
                        }
                        className={
                            compactMobile
                                ? "pointer-events-auto mx-auto flex h-10 w-full max-w-[300px] items-center justify-center bg-[var(--luxury-paper)] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--luxury-ink)] shadow-[0_16px_35px_rgba(22,18,13,0.16)] transition hover:bg-[var(--luxury-ink)] hover:text-[var(--luxury-paper)] disabled:bg-gray-200 disabled:text-gray-500 sm:h-11 sm:text-sm sm:tracking-[0.14em]"
                                : "pointer-events-auto mx-auto flex h-11 w-full max-w-[300px] items-center justify-center bg-[var(--luxury-paper)] text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-ink)] shadow-[0_16px_35px_rgba(22,18,13,0.16)] transition hover:bg-[var(--luxury-ink)] hover:text-[var(--luxury-paper)] disabled:bg-gray-200 disabled:text-gray-500 sm:tracking-[0.14em]"
                        }
                    >
                        {cartLoading ? "Adding..." : "+ Quick Add"}
                    </button>
                </div>
            </div>

            <div className={compactMobile ? "flex flex-1 flex-col p-3 sm:p-5" : "flex flex-1 flex-col p-4 sm:p-5"}>
                <p className={compactMobile ? "text-[10px] uppercase tracking-[0.12em] text-[var(--luxury-gold)] sm:text-xs sm:tracking-[0.28em]" : "text-xs uppercase tracking-[0.18em] text-[var(--luxury-gold)] sm:tracking-[0.28em]"}>
                    {product.brandName}
                </p>

                <h3 className={compactMobile ? "mt-2 line-clamp-2 text-base font-normal leading-tight [font-family:var(--font-serif)] sm:text-2xl" : "mt-2 text-xl font-normal leading-tight [font-family:var(--font-serif)] sm:text-2xl"}>
                    {product.name}
                </h3>

                <p className={compactMobile ? "mt-2 line-clamp-2 text-xs leading-5 text-[var(--luxury-muted)] sm:text-sm" : "mt-2 text-sm text-[var(--luxury-muted)]"}>
                    {product.gender} • {product.categoryName} •{" "}
                    {firstVariant?.variantName}
                </p>

                <p className={compactMobile ? "hidden sm:mt-3 sm:line-clamp-2 sm:block sm:text-sm sm:leading-6 sm:text-[var(--luxury-muted)]" : "mt-3 line-clamp-2 text-sm leading-6 text-[var(--luxury-muted)]"}>
                    {product.description}
                </p>

                <div className="mt-auto pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={compactMobile ? "text-base font-semibold sm:text-2xl" : "text-xl font-semibold sm:text-2xl"}>
                            ₹{firstVariant?.sellingPrice}
                        </span>

                        {lowStock && (
                            <span className="rounded-full border border-[#d7ad62] bg-[#fff6e4] px-3 py-1 text-xs font-medium text-[#8a5a12]">
                                Only {firstVariant.stockQuantity} left
                            </span>
                        )}
                    </div>

                </div>
            </div>
        </Link>
    );
}
