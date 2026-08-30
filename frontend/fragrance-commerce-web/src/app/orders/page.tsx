"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, RotateCcw, Star } from "lucide-react";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { OrdersPageSkeleton } from "@/components/common/OrdersPageSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import type { Order } from "@/types/order";
import { getOrders } from "@/services/orderService";
import { getStatusClasses } from "@/utils/orderStatus";
import { useAuth } from "@/contexts/AuthContext";
import { addToCart } from "@/services/cartService";
import { readCache, writeCache } from "@/utils/swrCache";
import { canPayNow, payOrderPayment } from "@/lib/payOrder";
import { getApiResponse } from "@/services/api";

export default function OrdersPage() {
    const { isLoggedIn } = useAuth();

    const [orders, setOrders] = useState<Order[]>(() =>
        readCache<Order[]>("orders") ?? []
    );
    const [loading, setLoading] = useState(orders.length === 0);
    const [cartError, setCartError] = useState("");
    const [payError, setPayError] = useState("");
    const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

    async function loadOrders() {
        try {
            const data = await getOrders();
            setOrders(data);
            writeCache("orders", data);
        } finally {
            setLoading(false);
        }
    }

    async function handleBuyAgain(productVariantId: string) {
        try {
            setCartError("");
            await addToCart(productVariantId, 1);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch {
            setCartError("Failed to add item to cart. Please try again.");
        }
    }

    async function handleRetryPayment(order: Order) {
        try {
            setPayError("");
            setPayingOrderId(order.id);

            const { paid } = await payOrderPayment(order);

            if (paid) {
                await loadOrders();
            }
        } catch (err) {
            const response = getApiResponse(err);

            setPayError(
                typeof response?.data === "string" &&
                    response.data.trim()
                    ? response.data
                    : err instanceof Error && err.message
                      ? err.message
                      : "Failed to complete payment. Please try again."
            );
        } finally {
            setPayingOrderId(null);
        }
    }

    useEffect(() => {
        if (isLoggedIn) loadOrders();
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

    if (loading && orders.length === 0) {
        return <OrdersPageSkeleton />;
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 border-b border-[#d8c8ad] pb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                            Purchase Archive
                        </p>

                        <h1 className="mt-3 text-3xl font-normal leading-[1.05] [font-family:var(--font-serif)] sm:text-5xl">
                            My Orders
                        </h1>
                    </div>

                    {orders.length === 0 ? (
                        <EmptyState
                            icon={Package}
                            title="No orders yet"
                            description="Start shopping and your orders will appear here."
                            actionLabel="Browse Products"
                            actionHref="/products"
                        />
                    ) : (
                        <>
                            {cartError && (
                                <p
                                    role="alert"
                                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                                >
                                    {cartError}
                                </p>
                            )}

                            {payError && (
                                <p
                                    role="alert"
                                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                                >
                                    {payError}
                                </p>
                            )}

                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)]"
                                >
                                    <div className="grid grid-cols-2 gap-4 border-b border-[#d8c8ad] bg-[#efe3d0] px-4 py-4 sm:px-6 md:grid-cols-4 md:gap-4">
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

                                    <div className="p-4 sm:p-6">
                                        <div className="space-y-5">
                                            {order.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="grid gap-4 border-b border-[#d8c8ad] pb-5 last:border-b-0 last:pb-0 sm:gap-5 md:grid-cols-[110px_1fr_220px]"
                                                >
                                                    <div className="relative h-24 w-full overflow-hidden rounded-[var(--luxury-radius)] bg-[var(--luxury-sand)] md:h-28 md:w-auto">
                                                        {item.imageUrl && (
                                                            <Image
                                                                src={
                                                                    item.imageUrl
                                                                }
                                                                alt=""
                                                                fill
                                                                className="object-contain p-3"
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">
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

                                                    <div className="grid gap-2 sm:grid-cols-3 md:flex md:flex-col md:gap-3 md:items-end">
                                                        {canPayNow(order) && (
                                                            <button
                                                                onClick={() =>
                                                                    handleRetryPayment(
                                                                        order
                                                                    )
                                                                }
                                                                disabled={
                                                                    payingOrderId ===
                                                                    order.id
                                                                }
                                                                className="flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--luxury-ink)] px-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] shadow-[0_12px_28px_rgba(22,18,13,0.12)] transition hover:bg-[var(--luxury-moss)] disabled:bg-[var(--luxury-muted-strong)] md:w-40"
                                                            >
                                                                {payingOrderId ===
                                                                order.id
                                                                    ? "Opening..."
                                                                    : "Pay Now"}
                                                            </button>
                                                        )}

                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="flex h-10 w-full items-center justify-center whitespace-nowrap rounded-full border border-[var(--luxury-line)] px-3 text-center text-xs font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold-strong)] hover:bg-[#fffaf2] md:w-40"
                                                        >
                                                            View Details
                                                        </Link>

                                                        <button
                                                            onClick={() => handleBuyAgain(item.productVariantId)}
                                                            className="flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[var(--luxury-line)] px-3 text-xs font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold-strong)] hover:bg-[#fffaf2] md:w-40">
                                                            <RotateCcw size={15} />
                                                            Buy Again
                                                        </button>
                                                        {order.status === "Delivered" && (
                                                            <Link
                                                                href={`/products/${item.productId}?review=true#reviews`}
                                                                className="flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--luxury-ink)] px-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] shadow-[0_12px_28px_rgba(22,18,13,0.12)] transition hover:bg-[var(--luxury-moss)] md:w-40"
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
                        </>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}
