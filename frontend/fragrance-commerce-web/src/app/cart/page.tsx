"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
    Check,
    ChevronDown,
    Loader2,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Cart } from "@/types/cart";
import {
    getCart,
    updateCartItem,
    removeCartItem,
    applyCoupon,
    removeCoupon,
} from "@/services/cartService";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { CartPageSkeleton } from "@/components/common/CartPageSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { readCache, writeCache } from "@/utils/swrCache";

const FREE_SHIPPING_THRESHOLD = 2000;

const easeLuxury = [0.22, 1, 0.36, 1] as const;

export default function CartPage() {
    const { isLoggedIn } = useAuth();

    const [cart, setCart] = useState<Cart | null>(() =>
        readCache<Cart>("cart")
    );
    const [loading, setLoading] = useState(cart === null);
    const [couponCode, setCouponCode] = useState("");
    const [couponExpanded, setCouponExpanded] = useState(false);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState("");

    const subtotal = cart?.totalAmount ?? 0;
    const itemCount =
        cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    const remainingForFreeShipping = Math.max(
        0,
        FREE_SHIPPING_THRESHOLD - subtotal
    );
    const shippingProgress = Math.min(
        100,
        Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
    );
    const cartBusy = updatingId !== null || removingIds.size > 0;

    async function loadCart() {
        try {
            setLoading(true);
            const data = await getCart();
            setCart(data);
            writeCache("cart", data);
        } catch {
            setCart(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!isLoggedIn) return;

        const timer = window.setTimeout(loadCart, 0);
        return () => window.clearTimeout(timer);
    }, [isLoggedIn]);

    async function increaseQuantity(
        cartItemId: string,
        currentQuantity: number
    ) {
        if (updatingId) return;

        setUpdatingId(cartItemId);
        setError("");
        try {
            const updatedCart = await updateCartItem(
                cartItemId,
                currentQuantity + 1
            );
            setCart(updatedCart);
        } catch {
            setError("Failed to update quantity.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function decreaseQuantity(
        cartItemId: string,
        currentQuantity: number
    ) {
        if (currentQuantity <= 1 || updatingId) return;

        setUpdatingId(cartItemId);
        setError("");
        try {
            const updatedCart = await updateCartItem(
                cartItemId,
                currentQuantity - 1
            );
            setCart(updatedCart);
        } catch {
            setError("Failed to update quantity.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function deleteItem(cartItemId: string) {
        if (removingIds.has(cartItemId)) return;

        setRemovingIds((prev) => new Set(prev).add(cartItemId));
        setError("");
        try {
            await removeCartItem(cartItemId);

            setCart((prev) => {
                if (!prev) return prev;
                const items = prev.items.filter(
                    (item) => item.id !== cartItemId
                );
                const newTotal = items.reduce(
                    (sum, item) => sum + item.totalPrice,
                    0
                );
                const discount = prev.discountAmount || 0;
                return {
                    ...prev,
                    items,
                    totalAmount: newTotal,
                    finalAmount: Math.max(0, newTotal - discount),
                };
            });

            getCart().then(setCart).catch(() => {});
        } catch {
            setError("Failed to remove item.");
        } finally {
            setRemovingIds((prev) => {
                const next = new Set(prev);
                next.delete(cartItemId);
                return next;
            });
        }
    }

    async function handleApplyCoupon() {
        if (!couponCode.trim()) return;

        try {
            setApplyingCoupon(true);
            setError("");
            const updatedCart = await applyCoupon(couponCode.trim());
            setCart(updatedCart);
            setCouponCode("");
        } catch {
            setError("Invalid or expired coupon.");
        } finally {
            setApplyingCoupon(false);
        }
    }

    async function handleRemoveCoupon() {
        const updatedCart = await removeCoupon();
        setCart(updatedCart);
    }

    if (!isLoggedIn) {
        return (
            <ProtectedRoute>
                <div />
            </ProtectedRoute>
        );
    }

    if (loading && !cart) {
        return <CartPageSkeleton />;
    }

    if (!cart) {
        return (
            <ProtectedRoute>
                <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 border-b border-[#d8c8ad] pb-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                                Shopping Bag
                            </p>

                            <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                                Your Cart
                            </h1>
                        </div>

                        <EmptyState
                            icon={ShoppingBag}
                            title="Couldn't load your bag"
                            description="Something went wrong while loading your cart. Please try again."
                            actionLabel="Retry"
                            onAction={loadCart}
                        />
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 border-b border-[#d8c8ad] pb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                            Shopping Bag
                        </p>

                        <h1 className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                            Your Cart
                            {itemCount > 0 && (
                                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--luxury-muted)]">
                                    {itemCount}{" "}
                                    {itemCount === 1 ? "item" : "items"}
                                </span>
                            )}
                        </h1>
                    </div>

                    {error && (
                        <p role="alert" className="mb-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {cart?.items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: easeLuxury,
                            }}
                        >
                            <EmptyState
                                icon={ShoppingBag}
                                title="Your cart is empty"
                                description="Add a signature scent or beauty essential to begin checkout."
                                actionLabel="Continue Shopping"
                                actionHref="/products"
                            />
                        </motion.div>
                    ) : (
                        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
                            <section>
                                <div className="space-y-6 border-t border-[#d8c8ad]">
                                    <AnimatePresence initial={false}>
                                        {cart?.items.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                transition={{
                                                    duration: 0.28,
                                                    delay: Math.min(
                                                        index * 0.04,
                                                        0.24
                                                    ),
                                                    ease: easeLuxury,
                                                }}
                                                className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-5 overflow-hidden border-b border-[#d8c8ad] py-6 sm:grid-cols-[132px_1fr_auto] md:grid-cols-[170px_1fr_auto] md:gap-5"
                                            >
                                                {item.imageUrl && (
                                                    <div className="relative h-32 w-full overflow-hidden rounded-[var(--luxury-radius)] bg-[var(--luxury-sand)] sm:h-32 sm:w-32 md:h-40 md:w-40">
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            fill
                                                            className="object-contain p-5 drop-shadow-[0_20px_22px_rgba(22,18,13,0.16)]"
                                                        />

                                                        <button
                                                            onClick={() =>
                                                                deleteItem(item.id)
                                                            }
                                                            disabled={
                                                                updatingId !== null ||
                                                                removingIds.has(item.id)
                                                            }
                                                            aria-label={`Remove ${item.productName} from cart`}
                                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,250,242,0.95)] text-red-600 shadow-[0_12px_30px_rgba(22,18,13,0.16)] backdrop-blur-md transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-90 disabled:opacity-50 sm:hidden"
                                                        >
                                                            {removingIds.has(
                                                                item.id
                                                            ) ? (
                                                                <Loader2
                                                                    size={15}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Trash2 size={15} />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] sm:tracking-[0.28em]">
                                                        {item.brandName}
                                                    </p>

                                                    <h3 className="mt-2 text-xl font-normal leading-tight [font-family:var(--font-serif)] sm:text-2xl">
                                                        {item.productName}
                                                    </h3>

                                                    <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                                        {item.gender} •{" "}
                                                        {item.categoryName} •{" "}
                                                        {item.variantName}
                                                    </p>

                                                    <div className="mt-4">
                                                        <motion.p
                                                            key={item.totalPrice}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 6,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.18,
                                                                ease: easeLuxury,
                                                            }}
                                                            className="text-xl font-semibold"
                                                        >
                                                            ₹{item.totalPrice}
                                                        </motion.p>
                                                    </div>

                                                    <div className="mt-5 flex items-center gap-4">
                                                        <button
                                                            onClick={() =>
                                                                decreaseQuantity(
                                                                    item.id,
                                                                    item.quantity
                                                                )
                                                            }
                                                            disabled={
                                                                item.quantity <=
                                                                    1 ||
                                                                updatingId !==
                                                                    null
                                                            }
                                                            aria-label={`Decrease quantity of ${item.productName}`}
                                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--luxury-line)] bg-[var(--luxury-paper)] transition-all duration-200 hover:border-[var(--luxury-gold)] hover:shadow-[0_8px_20px_rgba(22,18,13,0.08)] hover:scale-105 active:scale-90 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--luxury-gold)]"
                                                        >
                                                            <Minus size={16} />
                                                        </button>

                                                        <span className="relative flex h-10 w-10 items-center justify-center" aria-live="polite">
                                                            {updatingId ===
                                                            item.id ? (
                                                                <Loader2
                                                                    size={18}
                                                                    className="animate-spin text-[var(--luxury-gold)]"
                                                                />
                                                            ) : (
                                                                <motion.span
                                                                    key={
                                                                        item.quantity
                                                                    }
                                                                    initial={{
                                                                        opacity: 0,
                                                                        y: 8,
                                                                        scale: 0.8,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        y: 0,
                                                                        scale: 1,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.18,
                                                                        ease: easeLuxury,
                                                                    }}
                                                                    className="text-lg font-semibold"
                                                                >
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </motion.span>
                                                            )}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                increaseQuantity(
                                                                    item.id,
                                                                    item.quantity
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId !==
                                                                null
                                                            }
                                                            aria-label={`Increase quantity of ${item.productName}`}
                                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--luxury-line)] bg-[var(--luxury-paper)] transition-all duration-200 hover:border-[var(--luxury-gold)] hover:shadow-[0_8px_20px_rgba(22,18,13,0.08)] hover:scale-105 active:scale-90 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--luxury-gold)]"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        deleteItem(item.id)
                                                    }
                                                    disabled={
                                                        updatingId !== null ||
                                                        removingIds.has(item.id)
                                                    }
                                                    aria-label={`Remove ${item.productName} from cart`}
                                                    className="hidden h-10 w-10 items-center justify-center justify-self-end rounded-full bg-[var(--luxury-paper)] text-red-600 shadow-sm transition-all duration-200 hover:bg-red-50 hover:shadow-[0_8px_20px_rgba(127,29,29,0.08)] active:scale-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--luxury-gold)] sm:flex sm:justify-self-auto"
                                                >
                                                    {removingIds.has(
                                                        item.id
                                                    ) ? (
                                                        <Loader2
                                                            size={18}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>

                            <aside className="h-fit rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6 lg:sticky lg:top-24 lg:z-10">
                                <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                    Cost Summary
                                </h2>

                                <div className="mt-6">
                                    <div className="flex items-end justify-between gap-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--luxury-muted)]">
                                            Complimentary Delivery
                                        </p>

                                        {remainingForFreeShipping > 0 ? (
                                            <p className="text-xs font-semibold text-[var(--luxury-gold-strong)]">
                                                ₹{remainingForFreeShipping} to
                                                go
                                            </p>
                                        ) : (
                                            <Check
                                                size={16}
                                                className="text-[#3f5f32]"
                                            />
                                        )}
                                    </div>

                                    <div
                                        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#efe3d0]"
                                        role="progressbar"
                                        aria-label="Progress toward complimentary delivery"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={Math.round(shippingProgress)}
                                    >
                                        <motion.div
                                            className="h-full rounded-full bg-[var(--luxury-gold)]"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${shippingProgress}%`,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                ease: easeLuxury,
                                            }}
                                        />
                                    </div>

                                    <p
                                        aria-live="polite"
                                        className="mt-2 text-xs leading-5 text-[var(--luxury-muted)]"
                                    >
                                        {remainingForFreeShipping > 0
                                            ? `Add ₹${remainingForFreeShipping} more to unlock complimentary delivery on this order.`
                                            : "You've unlocked complimentary delivery on this order."}
                                    </p>
                                </div>

                                <div className="mt-6 border-t border-[#d8c8ad]">
                                    <div className="flex justify-between border-b border-[#d8c8ad] py-4">
                                        <span className="font-medium">
                                            Subtotal
                                        </span>
                                        <span className="font-semibold">
                                            <motion.span
                                                key={subtotal}
                                                initial={{
                                                    opacity: 0,
                                                    y: 6,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    duration: 0.18,
                                                    ease: easeLuxury,
                                                }}
                                                className="inline-block"
                                            >
                                                ₹{subtotal}
                                            </motion.span>
                                        </span>
                                    </div>

                                    {(cart?.discountAmount ?? 0) > 0 && (
                                        <div className="border-b border-[#d8c8ad] py-4">
                                            <div className="flex justify-between">
                                                <span className="font-medium">
                                                    Discount
                                                </span>

                                                <span className="font-semibold text-[#3f5f32]">
                                                    <motion.span
                                                        key={
                                                            cart?.discountAmount ?? 0
                                                        }
                                                        initial={{
                                                            opacity: 0,
                                                            y: 6,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.18,
                                                            ease: easeLuxury,
                                                        }}
                                                        className="inline-block"
                                                    >
                                                        {`-₹${cart.discountAmount}`}
                                                    </motion.span>
                                                </span>
                                            </div>

                                            {cart?.couponCode && (
                                                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                                                    {cart.couponCode}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-between border-b border-[#d8c8ad] py-4">
                                        <span className="font-medium">
                                            Estimated Shipping
                                        </span>
                                        <span className="font-semibold">
                                            Free
                                        </span>
                                    </div>

                                    <div className="flex justify-between py-5 text-xl font-semibold">
                                        <span>Total Payable</span>
                                        <span className="[font-family:var(--font-serif)]">
                                            <motion.span
                                                key={cart?.finalAmount ?? 0}
                                                initial={{
                                                    opacity: 0,
                                                    y: 6,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    duration: 0.18,
                                                    ease: easeLuxury,
                                                }}
                                                className="inline-block"
                                            >
                                                ₹{cart?.finalAmount}
                                            </motion.span>
                                        </span>
                                    </div>
                                </div>

                                {(cart?.discountAmount ?? 0) > 0 && (
                                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#3f5f32]">
                                            You&apos;re saving ₹
                                            {cart.discountAmount} today
                                        </p>
                                    )}

                                {cartBusy && (
                                    <div className="mt-5 flex items-center justify-center gap-2 rounded-full border border-[#d8c8ad] bg-[#fffaf2] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--luxury-muted)]">
                                        <Loader2
                                            size={13}
                                            className="animate-spin text-[var(--luxury-gold)]"
                                        />
                                        Updating your bag...
                                    </div>
                                )}

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCouponExpanded(
                                                (prev) => !prev
                                            )
                                        }
                                        aria-expanded={
                                            couponExpanded ||
                                            Boolean(cart?.couponCode)
                                        }
                                        aria-controls="coupon-panel"
                                        className="flex w-full items-center justify-between gap-3 py-1 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--luxury-gold)]"
                                    >
                                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
                                            Coupon
                                        </h3>

                                        <span className="flex items-center gap-2">
                                            {cart?.couponCode && (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#3f5f32]">
                                                    <Check
                                                        size={14}
                                                    />
                                                    {cart.couponCode}
                                                </span>
                                            )}

                                            <ChevronDown
                                                size={16}
                                                className={`shrink-0 text-[var(--luxury-muted)] transition-transform duration-300 ${
                                                    couponExpanded ||
                                                    Boolean(
                                                        cart?.couponCode
                                                    )
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {(couponExpanded ||
                                            Boolean(cart?.couponCode)) && (
                                            <motion.div
                                                id="coupon-panel"
                                                key="coupon-panel"
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                transition={{
                                                    duration: 0.22,
                                                    ease: easeLuxury,
                                                }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-3">
                                                    {cart?.couponCode ? (
                                                        <div className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-input)] px-4 py-3">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="flex items-center gap-2 text-sm font-semibold">
                                                                        {cart.couponCode}
                                                                        <Check
                                                                            size={15}
                                                                            className="text-green-700"
                                                                        />
                                                                    </p>

                                                                    <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                                                        You saved ₹
                                                                        {cart.discountAmount}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    onClick={
                                                                        handleRemoveCoupon
                                                                    }
                                                                    className="shrink-0 text-sm font-semibold uppercase tracking-[0.12em] text-red-600 transition-colors duration-200 hover:text-red-700"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                                                            <input
                                                                value={couponCode}
                                                                onChange={(e) =>
                                                                    setCouponCode(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Coupon code"
                                                                aria-label="Coupon code"
                                                                autoComplete="off"
                                                                className="w-full border border-[var(--luxury-line)] bg-[var(--luxury-input)] px-3 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-[var(--luxury-gold)] sm:min-w-0 sm:flex-1"
                                                            />

                                                            <button
                                                                onClick={
                                                                    handleApplyCoupon
                                                                }
                                                                disabled={
                                                                    applyingCoupon ||
                                                                    cartBusy
                                                                }
                                                                className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--luxury-ink)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition-all duration-200 hover:bg-[var(--luxury-moss)] active:scale-[0.96] disabled:bg-[var(--luxury-muted-strong)] disabled:hover:scale-100 sm:w-auto sm:shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--luxury-gold)]"
                                                            >
                                                                {applyingCoupon && (
                                                                    <Loader2
                                                                        size={13}
                                                                        className="animate-spin"
                                                                    />
                                                                )}
                                                                {applyingCoupon
                                                                    ? "Applying"
                                                                    : "Apply"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <Link
                                    href="/checkout"
                                    aria-disabled={cartBusy}
                                    tabIndex={cartBusy ? -1 : undefined}
                                    className={`mt-6 block rounded-full bg-[var(--luxury-ink)] py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition-all duration-200 hover:bg-[var(--luxury-moss)] hover:shadow-[0_18px_38px_rgba(22,18,13,0.16)] hover:scale-[1.01] active:scale-[0.98] ${
                                        cartBusy
                                            ? "pointer-events-none opacity-60"
                                            : ""
                                    }`}
                                >
                                    Check Out Now
                                </Link>

                                <Link
                                    href="/products"
                                    className="mt-3 block rounded-full border border-[var(--luxury-line)] py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:bg-[#fffaf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--luxury-gold)]"
                                >
                                    Continue Shopping
                                </Link>
                            </aside>
                        </div>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}
