"use client";

import Image from "next/image";
import { PackageX } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { EmptyState } from "@/components/common/EmptyState";
import type { Order } from "@/types/order";
import { cancelOrder, getOrderById } from "@/services/orderService";
import { getStatusClasses } from "@/utils/orderStatus";
import { readCache, writeCache } from "@/utils/swrCache";
import { canPayNow, payOrderPayment } from "@/lib/payOrder";
import { getApiResponse } from "@/services/api";

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(() =>
        readCache<Order>(`order:${orderId}`)
    );
    const [loading, setLoading] = useState(order === null);
    const [cancelling, setCancelling] = useState(false);
    const [confirmingCancel, setConfirmingCancel] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState("");

    async function loadOrder() {
        try {
            const data = await getOrderById(orderId);
            setOrder(data);
            writeCache(`order:${orderId}`, data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    async function handleCancelOrder() {
        if (!order) return;

        try {
            setCancelling(true);
            setCancelError("");
            const updatedOrder = await cancelOrder(order.id);
            setOrder(updatedOrder);
            setConfirmingCancel(false);
        } catch (error) {
            console.error(error);
            setCancelError("Failed to cancel order. Please try again.");
        } finally {
            setCancelling(false);
        }
    }

    async function handleRetryPayment() {
        if (!order) return;

        try {
            setPaying(true);
            setPayError("");

            const { paid } = await payOrderPayment(order);

            if (paid) {
                await loadOrder();
            }
        } catch (err) {
            const response = getApiResponse(err);

            setPayError(
                typeof response?.data === "string" &&
                    response.data.trim()
                    ? response.data
                    : "Failed to complete payment. Please try again."
            );
        } finally {
            setPaying(false);
        }
    }

    if (loading && !order) {
        return (
            <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 border-b border-[#d8c8ad] pb-6">
                        <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />

                        <div className="mt-3 h-10 w-48 animate-pulse rounded bg-[#e5d9c4]" />
                    </div>

                        <div className="overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)]">
                        <div className="grid gap-4 border-b border-[#d8c8ad] bg-[#efe3d0] px-4 py-4 sm:px-6 md:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i}>
                                    <div className="h-3 w-16 animate-pulse rounded bg-[#e5d9c4]" />

                                    <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                                </div>
                            ))}
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="h-7 w-40 animate-pulse rounded bg-[#e5d9c4]" />

                            <div className="mt-5 space-y-5">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="grid gap-5 border-b border-[#d8c8ad] pb-5 last:border-b-0 last:pb-0 md:grid-cols-[110px_1fr_220px]">
                                        <div className="h-28 w-full animate-pulse rounded bg-[#e5d9c4] md:w-28" />

                                        <div>
                                            <div className="h-4 w-40 animate-pulse rounded bg-[#e5d9c4]" />
                                            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />
                                        </div>

                                        <div className="h-4 w-16 animate-pulse rounded bg-[#e5d9c4] md:ml-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[var(--luxury-ivory)] px-6 py-10 text-[var(--luxury-ink)]">
                <div className="mx-auto max-w-5xl">
                    <EmptyState
                        icon={PackageX}
                        title="Order not found"
                        description="This order may no longer be available."
                        actionLabel="Back to Orders"
                        actionHref="/orders"
                    />
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-5xl">
                <button
                    onClick={() => router.push("/orders")}
                    className="mb-6 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)] hover:text-[var(--luxury-gold-strong)]"
                >
                    ← Back to Orders
                </button>

                <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-4 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6">
                    <div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                                    Order Details
                                </p>

                                <h1 className="mt-3 text-2xl font-normal leading-tight [font-family:var(--font-serif)] sm:text-3xl">
                                    Order #{order.orderNumber}
                                </h1>

                                <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                    {new Date(order.orderedAt).toLocaleString()}
                                </p>
                            </div>

                            <span
                                className={`w-fit rounded-full ${getStatusClasses(
                                    order.status
                                )}`}
                            >
                                {order.status}
                            </span>
                        </div>

                        {order.status === "Cancelled" ? (
                            <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                                This order has been cancelled.
                            </div>
                        ) : (
                            <OrderTimeline currentStatus={order.status} />
                        )}
                    </div>

                    <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
                        <section className="border border-[#d8c8ad] bg-[#fffaf2] p-4">
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em]">
                                Shipping Address
                            </h2>

                            <p className="font-medium">{order.shippingAddress.fullName}</p>

                            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                {order.shippingAddress.addressLine1}
                                {order.shippingAddress.addressLine2 &&
                                    `, ${order.shippingAddress.addressLine2}`}
                            </p>

                            <p className="text-sm text-[var(--luxury-muted)]">
                                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                                {order.shippingAddress.postalCode}
                            </p>

                            <p className="text-sm text-[var(--luxury-muted)]">
                                {order.shippingAddress.country}
                            </p>

                            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                Phone: {order.shippingAddress.phoneNumber}
                            </p>
                        </section>

                        <section className="border border-[#d8c8ad] bg-[#fffaf2] p-4">
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em]">Payment</h2>

                            <p className="text-sm text-[var(--luxury-muted)]">
                                Method: {order.payment.paymentMethod}
                            </p>

                            <p className="text-sm text-[var(--luxury-muted)]">
                                Status: {order.payment.paymentStatus}
                            </p>

                            <p className="text-sm text-[var(--luxury-muted)]">
                                Amount: ₹{order.payment.amount}
                            </p>

                            {order.payment.transactionId && (
                                <p className="text-sm text-[var(--luxury-muted)]">
                                    Transaction ID: {order.payment.transactionId}
                                </p>
                            )}

                            {canPayNow(order) && (
                                <div className="mt-4">
                                    <button
                                        onClick={handleRetryPayment}
                                        disabled={paying}
                                        className="w-full rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition hover:bg-[var(--luxury-moss)] disabled:bg-[var(--luxury-muted-strong)] sm:w-auto"
                                    >
                                        {paying ? "Opening..." : `Pay Now • ₹${order.payment.amount}`}
                                    </button>

                                    {payError && (
                                        <p
                                            role="alert"
                                            className="mt-3 text-sm font-medium text-red-700"
                                        >
                                            {payError}
                                        </p>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    <section className="mt-8">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Items</h2>

                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid gap-3 border border-[#d8c8ad] bg-[#fffaf2] p-3 sm:p-4 md:grid-cols-[96px_1fr_auto]"
                                >
                                    <div className="relative h-20 overflow-hidden bg-[#efe3d0] sm:h-24">
                                        {item.imageUrl && (
                                            <Image
                                                src={item.imageUrl}
                                                alt=""
                                                fill
                                                className="object-contain p-3 drop-shadow-[0_16px_18px_rgba(22,18,13,0.14)]"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-medium">{item.productName}</p>

                                        <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                            {item.variantName} × {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-semibold md:text-right">₹{item.totalPrice}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 border border-[#d8c8ad] bg-[#efe3d0] p-4">
                        <div className="flex justify-between">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
                        </div>

                        <div className="mt-2 flex justify-between">
                            <span>Discount</span>
                            <span>₹{order.discountAmount}</span>
                        </div>

                        <div className="mt-4 flex justify-between border-t border-[#d8c8ad] pt-4 text-xl font-semibold">
                            <span>Final Amount</span>
                            <span>₹{order.finalAmount}</span>
                        </div>
                    </section>

                    {order.status !== "Cancelled" && order.status !== "Delivered" && (
                        <div className="mt-6">
                            {confirmingCancel ? (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 p-4"
                                >
                                    <p className="text-sm font-semibold text-red-700">
                                        Are you sure you want to cancel this order?
                                    </p>

                                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                        <button
                                            onClick={handleCancelOrder}
                                            disabled={cancelling}
                                            className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-red-700 disabled:bg-[var(--luxury-muted-strong)] sm:w-auto"
                                        >
                                            {cancelling
                                                ? "Cancelling..."
                                                : "Yes, Cancel Order"}
                                        </button>

                                        <button
                                            onClick={() =>
                                                setConfirmingCancel(false)
                                            }
                                            disabled={cancelling}
                                            className="rounded-full border border-[var(--luxury-line)] bg-[var(--luxury-paper)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-ink)] transition hover:border-[var(--luxury-gold-strong)] sm:w-auto"
                                        >
                                            Keep Order
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmingCancel(true)}
                                    className="w-full rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-red-700 sm:w-auto"
                                >
                                    Cancel Order
                                </button>
                            )}

                            {cancelError && (
                                <p
                                    role="alert"
                                    className="mt-3 text-sm font-medium text-red-700"
                                >
                                    {cancelError}
                                </p>
                            )}
                        </div>
                    )}
                </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
