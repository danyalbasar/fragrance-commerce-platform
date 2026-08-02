"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Check } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";

export default function CartPage() {
    const { isLoggedIn } = useAuth();

    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [couponCode, setCouponCode] = useState("");
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    async function loadCart() {
        try {
            setLoading(true);
            const data = await getCart();
            setCart(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        loadCart();
    }, [isLoggedIn]);

    async function increaseQuantity(cartItemId: string, currentQuantity: number) {
        const updatedCart = await updateCartItem(cartItemId, currentQuantity + 1);
        setCart(updatedCart);
    }

    async function decreaseQuantity(cartItemId: string, currentQuantity: number) {
        if (currentQuantity <= 1) return;

        const updatedCart = await updateCartItem(cartItemId, currentQuantity - 1);
        setCart(updatedCart);
    }

    async function deleteItem(cartItemId: string) {
        await removeCartItem(cartItemId);
        await loadCart();
    }

    async function handleApplyCoupon() {
        if (!couponCode.trim()) return;

        try {
            setApplyingCoupon(true);
            const updatedCart = await applyCoupon(couponCode.trim());
            setCart(updatedCart);
            setCouponCode("");
        } catch {
            alert("Invalid or expired coupon.");
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

    if (loading) {
        return <div className="bg-[var(--luxury-ivory)] p-8 text-xl text-[var(--luxury-ink)]">Loading Cart...</div>;
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 border-b border-[#d8c8ad] pb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--luxury-gold)] sm:tracking-[0.34em]">
                            Shopping Bag
                        </p>

                        <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                            Your Cart
                        </h1>
                    </div>

                    {cart?.items.length === 0 ? (
                        <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 text-center shadow-[0_18px_45px_rgba(22,18,13,0.06)] sm:p-10">
                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                There are no products in your cart
                            </h2>

                            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                Add a signature scent or beauty essential to begin checkout.
                            </p>

                            <Link
                                href="/products"
                                className="mt-6 inline-block rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] sm:tracking-[0.16em]"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
                            <section>
                                <div className="space-y-6 border-t border-[#d8c8ad]">
                                    {cart?.items.map((item) => (
                                        <div
                                            key={item.id}
                                        className="grid gap-4 border-b border-[#d8c8ad] py-6 sm:grid-cols-[132px_1fr_auto] md:grid-cols-[170px_1fr_auto] md:gap-5"
                                        >
                                            {item.imageUrl && (
                                                <div className="relative h-36 w-full overflow-hidden bg-[#efe3d0] sm:h-32 sm:w-32 md:h-40 md:w-40">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.productName}
                                                        fill
                                                        className="object-contain p-5 drop-shadow-[0_20px_22px_rgba(22,18,13,0.16)]"
                                                    />
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <p className="text-xs uppercase tracking-[0.18em] text-[var(--luxury-gold)] sm:tracking-[0.28em]">
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

                                                <p className="mt-4 text-xl font-semibold">
                                                    ₹{item.unitPrice}
                                                </p>

                                                <div className="mt-5 flex items-center gap-4">
                                                    <button
                                                        onClick={() =>
                                                            decreaseQuantity(
                                                                item.id,
                                                                item.quantity
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity <= 1
                                                        }
                                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)] transition hover:border-[var(--luxury-gold)] disabled:opacity-40"
                                                    >
                                                        <Minus size={16} />
                                                    </button>

                                                    <span className="text-lg font-semibold">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            increaseQuantity(
                                                                item.id,
                                                                item.quantity
                                                            )
                                                        }
                                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)] transition hover:border-[var(--luxury-gold)]"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    deleteItem(item.id)
                                                }
                                                className="justify-self-end flex h-10 w-10 items-center justify-center rounded-full bg-[var(--luxury-paper)] text-red-600 shadow-sm transition hover:bg-red-50 sm:justify-self-auto"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <aside className="h-fit border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6 lg:sticky lg:top-24">
                                <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                    Cost Summary
                                </h2>

                                <div className="mt-6 border-t border-[#d8c8ad]">
                                    <div className="flex justify-between border-b border-[#d8c8ad] py-4">
                                        <span className="font-medium">
                                            Subtotal
                                        </span>
                                        <span className="font-semibold">
                                            ₹{cart?.totalAmount}
                                        </span>
                                    </div>

                                    <div className="border-b border-[#d8c8ad] py-4">
                                        <div className="flex justify-between">
                                            <span className="font-medium">
                                                Discount
                                            </span>

                                            <span
                                                className={
                                                    cart?.discountAmount &&
                                                        cart.discountAmount > 0
                                                ? "font-semibold text-[#3f5f32]"
                                                        : "font-semibold"
                                                }
                                            >
                                                {cart?.discountAmount &&
                                                    cart.discountAmount > 0
                                                    ? `-₹${cart.discountAmount}`
                                                    : "₹0"}
                                            </span>
                                        </div>

                                        {cart?.couponCode && (
                                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                                                {cart.couponCode}
                                            </p>
                                        )}
                                    </div>

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
                                        <span>₹{cart?.finalAmount}</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em]">
                                        Coupon
                                    </h3>

                                    {cart?.couponCode ? (
                                        <div className="border border-[#d8c8ad] bg-[#fffaf2] px-4 py-3">
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
                                                    onClick={handleRemoveCoupon}
                                                    className="shrink-0 text-sm font-semibold uppercase tracking-[0.12em] text-red-600 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <input
                                                value={couponCode}
                                                onChange={(e) =>
                                                    setCouponCode(e.target.value)
                                                }
                                                placeholder="Coupon code"
                                                className="min-w-0 flex-1 border border-[#d8c8ad] bg-[#fffaf2] px-3 py-2.5 text-sm outline-none focus:border-[var(--luxury-gold)]"
                                            />

                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={applyingCoupon}
                                                className="rounded-full bg-[var(--luxury-ink)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] disabled:bg-gray-400"
                                            >
                                                {applyingCoupon
                                                    ? "..."
                                                    : "Apply"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href="/checkout"
                                    className="mt-6 block rounded-full bg-[var(--luxury-ink)] py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)]"
                                >
                                    Check Out Now
                                </Link>

                                <Link
                                    href="/products"
                                    className="mt-3 block rounded-full border border-[#d8c8ad] py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--luxury-gold)]"
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
