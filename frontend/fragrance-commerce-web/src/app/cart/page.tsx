"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Cart } from "@/types/cart";
import { getCart, updateCartItem, removeCartItem, applyCoupon, removeCoupon } from "@/services/cartService";
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
        } catch (error) {
            console.error(error);
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
        return <div className="p-8 text-xl">Loading Cart...</div>;
    }

    return (
        <ProtectedRoute>
            <main className="mx-auto max-w-6xl p-8">
                <h1 className="mb-8 text-4xl font-bold">Cart</h1>

                {cart?.items.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <div className="space-y-4">
                        {cart?.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between gap-4 rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-4">
                                    {item.imageUrl && (
                                        <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="font-semibold">{item.productName}</h3>
                                        <p className="text-gray-500">{item.variantName}</p>
                                        <p className="mt-2 font-bold">₹{item.unitPrice}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => decreaseQuantity(item.id, item.quantity)}
                                        className="rounded border px-3 py-1"
                                    >
                                        -
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        onClick={() => increaseQuantity(item.id, item.quantity)}
                                        className="rounded border px-3 py-1"
                                    >
                                        +
                                    </button>

                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="ml-4 rounded bg-red-500 px-3 py-1 text-white"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="mt-8 rounded-lg border p-6">
                            <h2 className="mb-4 text-lg font-semibold">Coupon</h2>

                            {cart?.couponCode ? (
                                <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                                    <span className="text-sm font-medium text-green-700">
                                        Coupon applied: {cart.couponCode}
                                    </span>

                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="text-sm font-semibold text-red-500"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter coupon code"
                                        className="flex-1 rounded-lg border px-4 py-3"
                                    />

                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={applyingCoupon}
                                        className="rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:bg-gray-400"
                                    >
                                        {applyingCoupon ? "Applying..." : "Apply"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 rounded-lg border p-6">
                            <div className="flex justify-between">
                                <span>Total</span>
                                <span>₹{cart?.totalAmount}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>₹{cart?.discountAmount}</span>
                            </div>

                            <div className="mt-4 flex justify-between text-xl font-bold">
                                <span>Final Amount</span>
                                <span>₹{cart?.finalAmount}</span>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="mt-6 block rounded-full bg-black py-3 text-center font-semibold text-white hover:bg-neutral-800"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}