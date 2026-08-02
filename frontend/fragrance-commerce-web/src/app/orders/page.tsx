"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, RotateCcw, Star } from "lucide-react";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import type { Order } from "@/types/order";
import { getOrders } from "@/services/orderService";
import { getStatusClasses } from "@/utils/orderStatus";
import { useAuth } from "@/contexts/AuthContext";
import { addToCart } from "@/services/cartService";

export default function OrdersPage() {
    const { isLoggedIn } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadOrders() {
        try {
            const data = await getOrders();
            setOrders(data);
        } finally {
            setLoading(false);
        }
    }

    async function handleBuyAgain(productVariantId: string) {
        try {
            await addToCart(productVariantId, 1);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch {
            alert("Failed to add item to cart.");
        }
    }

    useEffect(() => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        loadOrders();
    }, [isLoggedIn]);

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    if (!isLoggedIn) {
        return (
            <ProtectedRoute>
                <div />
            </ProtectedRoute>
        );
    }

    if (loading) {
        return <div className="bg-[var(--luxury-ivory)] p-8 text-xl text-[var(--luxury-ink)]">Loading orders...</div>;
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-6 py-10 text-[var(--luxury-ink)]">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 border-b border-[#d8c8ad] pb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
                            Purchase Archive
                        </p>

                        <h1 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">
                            My Orders
                        </h1>
                    </div>

                    {orders.length === 0 ? (
                        <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-10 text-center shadow-[0_18px_45px_rgba(22,18,13,0.06)]">
                            <Package className="mx-auto mb-4 text-[var(--luxury-gold)]" size={36} />

                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                No orders yet
                            </h2>

                            <p className="mt-2 text-[var(--luxury-muted)]">
                                Start shopping and your orders will appear here.
                            </p>

                            <Link
                                href="/products"
                                className="mt-6 inline-block rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)]"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="overflow-hidden border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]"
                                >
                                    <div className="grid gap-4 border-b border-[#d8c8ad] bg-[#efe3d0] px-6 py-4 md:grid-cols-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                                                Order Placed
                                            </p>
                                            <p className="font-semibold">
                                                {formatDate(order.orderedAt)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                                                Total
                                            </p>
                                            <p className="font-semibold">
                                                ₹{order.finalAmount}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                                                Order Number
                                            </p>
                                            <p className="font-semibold">
                                                #{order.orderNumber}
                                            </p>
                                        </div>

                                        <div className="flex items-start justify-start md:justify-end">
                                            <span
                                                className={`rounded-full ${getStatusClasses(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-5">
                                            {order.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="grid gap-5 border-b border-[#d8c8ad] pb-5 last:border-b-0 last:pb-0 md:grid-cols-[110px_1fr_220px]"
                                                >
                                                    <div className="relative h-28 overflow-hidden bg-[#efe3d0]">
                                                        {item.imageUrl && (
                                                            <Image
                                                                src={
                                                                    item.imageUrl
                                                                }
                                                                alt={
                                                                    item.productName
                                                                }
                                                                fill
                                                                className="object-contain p-3"
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--luxury-gold)]">
                                                            {item.brandName}
                                                        </p>

                                                        <h3 className="mt-1 text-xl font-normal [font-family:var(--font-serif)]">
                                                            {item.productName}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                                            {item.gender} •{" "}
                                                            {item.categoryName} •{" "}
                                                            {item.variantName}
                                                        </p>

                                                        <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                                            Qty: {item.quantity}
                                                        </p>

                                                        <p className="mt-2 font-semibold">
                                                            ₹{item.totalPrice}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col gap-3 md:items-end">
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="flex h-10 w-full items-center justify-center whitespace-nowrap rounded-full border border-[#d8c8ad] px-3 text-center text-xs font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold)] md:w-40"
                                                        >
                                                            View Details
                                                        </Link>

                                                        <button
                                                            onClick={() => handleBuyAgain(item.productVariantId)}
                                                            className="flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#d8c8ad] px-3 text-xs font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold)] md:w-40">
                                                            <RotateCcw size={15} />
                                                            Buy Again
                                                        </button>
                                                        {order.status === "Delivered" && (
                                                            <Link
                                                                href={`/products/${item.productId}?review=true#reviews`}
                                                                className="flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--luxury-ink)] px-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] md:w-40"
                                                            >
                                                                <Star size={15} />
                                                                Write Review
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}
