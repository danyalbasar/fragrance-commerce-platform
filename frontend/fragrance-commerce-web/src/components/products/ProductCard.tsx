"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { addToCart } from "@/services/cartService";
import { formatPrice } from "@/utils/format";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
} from "@/services/wishlistService";
import { useAuth } from "@/contexts/AuthContext";

interface ProductCardProps {
    product: Product;
    compactMobile?: boolean;
    onQuickAdd?: (product: Product) => void;
}

const ProductCard = memo(function ProductCard({
    product,
    compactMobile = false,
    onQuickAdd,
}: ProductCardProps) {
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
    const lowestPrice = product.variants.reduce(
        (min, v) => (v.sellingPrice < min ? v.sellingPrice : min),
        firstVariant?.sellingPrice ?? 0
    );
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

        if (onQuickAdd) {
            onQuickAdd(product);
            return;
        }

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
        <div className="group relative flex h-full flex-col overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--luxury-gold)] hover:shadow-[var(--luxury-shadow-md)] active:scale-[0.99]">
            <div
                className={
                    compactMobile
                        ? "relative aspect-[1/1.08] overflow-hidden bg-[var(--luxury-sand)] md:aspect-square"
                        : "relative aspect-square overflow-hidden bg-[var(--luxury-sand)]"
                }
            >
                <div className="absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--luxury-gold),transparent)]" />
                <Link
                    href={`/products/${product.id}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0"
                >
                    {primaryImage && (
                        <Image
                            src={primaryImage}
                            alt=""
                            fill
                            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 50vw"
                            className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                        />
                    )}
                </Link>

                <button
                    onClick={handleWishlistClick}
                    disabled={wishlistLoading}
                    aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                    className={`absolute right-3 top-3 z-10 rounded-full p-1.5 text-[var(--luxury-ink)] transition-all duration-200 ease-out hover:text-[var(--luxury-gold)] hover:scale-110 active:scale-90 disabled:opacity-50 sm:right-4 sm:top-4 ${
                        isWishlisted
                            ? "translate-y-0 opacity-100"
                            : "translate-y-0 opacity-100 md:translate-y-[-6px] md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
                    }`}
                >
                    <Heart
                        size={20}
                        fill={isWishlisted ? "var(--luxury-gold)" : "var(--luxury-paper)"}
                        strokeWidth={isWishlisted ? 0 : 2}
                        className={`transition-all duration-200 drop-shadow-[0_1px_2px_rgba(22,18,13,0.4)] ${isWishlisted ? "text-transparent" : "text-[var(--luxury-muted)]"}`}
                    />
                </button>

                <div
                    className={
                        compactMobile
                            ? "pointer-events-none absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-all duration-200 md:inset-x-6 md:bottom-5 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
                            : "pointer-events-none absolute inset-x-4 bottom-4 translate-y-0 opacity-100 transition-all duration-200 md:inset-x-6 md:bottom-5 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
                    }
                >
                    <button
                        onClick={handleQuickAdd}
                        disabled={
                            cartLoading ||
                            !firstVariant ||
                            firstVariant.stockQuantity <= 0
                        }
                        className={
                            compactMobile
                                ? "pointer-events-auto mx-auto flex h-10 w-full max-w-[300px] items-center justify-center rounded-[var(--luxury-radius)] bg-[var(--luxury-paper)] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--luxury-ink)] shadow-[0_16px_35px_rgba(22,18,13,0.16)] transition-all duration-200 hover:bg-[var(--luxury-ink)] hover:text-[var(--luxury-paper)] hover:shadow-[0_20px_40px_rgba(22,18,13,0.24)] active:scale-[0.98] disabled:bg-[#e5ddd0] disabled:text-[var(--luxury-muted-strong)] sm:h-11 sm:text-sm sm:tracking-[0.14em]"
                                : "pointer-events-auto mx-auto flex h-11 w-full max-w-[300px] items-center justify-center rounded-[var(--luxury-radius)] bg-[var(--luxury-paper)] text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-ink)] shadow-[0_16px_35px_rgba(22,18,13,0.16)] transition-all duration-200 hover:bg-[var(--luxury-ink)] hover:text-[var(--luxury-paper)] hover:shadow-[0_20px_40px_rgba(22,18,13,0.24)] active:scale-[0.98] disabled:bg-[#e5ddd0] disabled:text-[var(--luxury-muted-strong)] sm:tracking-[0.14em]"
                        }
                    >
                        {cartLoading ? "Adding..." : "+ Quick Add"}
                    </button>
                </div>
            </div>

            <div className={compactMobile ? "flex flex-1 flex-col p-3 sm:p-5" : "flex flex-1 flex-col p-4 sm:p-5"}>
                <Link href={`/products/${product.id}`} className="block">
                    <p className={compactMobile ? "text-[10px] uppercase tracking-[0.12em] text-[var(--luxury-gold-strong)] sm:text-xs sm:tracking-[0.28em]" : "text-xs uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] sm:tracking-[0.28em]"}>
                        {product.brandName}
                    </p>

                    <h3 className={compactMobile ? "mt-2 line-clamp-2 text-base font-normal leading-tight [font-family:var(--font-serif)] sm:text-2xl" : "mt-2 text-xl font-normal leading-[1.08] [font-family:var(--font-serif)] sm:text-2xl"}>
                        {product.name}
                    </h3>
                </Link>

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
                            {product.variants.length > 1 && (
                                <span className="text-[0.65em] font-normal text-[var(--luxury-muted)]">From </span>
                            )}
                            {formatPrice(lowestPrice)}
                        </span>

                        {lowStock && (
                            <span className="rounded-full border border-[#d7ad62] bg-[#fff6e4] px-3 py-1 text-xs font-medium text-[#8a5a12]">
                                Only {firstVariant.stockQuantity} left
                            </span>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
});

export default ProductCard;
