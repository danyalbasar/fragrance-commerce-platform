"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import OrderTimeline from "@/components/orders/OrderTimeline";
import type { Order } from "@/types/order";
import { cancelOrder, getOrderById } from "@/services/orderService";
import { getStatusClasses } from "@/utils/orderStatus";

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    async function loadOrder() {
        try {
            const data = await getOrderById(orderId);
            setOrder(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    async function handleCancelOrder() {
        if (!order) return;

        const confirmed = confirm("Are you sure you want to cancel this order?");
        if (!confirmed) return;

        try {
            setCancelling(true);
            const updatedOrder = await cancelOrder(order.id);
            setOrder(updatedOrder);
        } catch (error) {
            console.error(error);
            alert("Failed to cancel order.");
        } finally {
            setCancelling(false);
        }
    }

    if (loading) {
        return <div className="bg-[var(--luxury-ivory)] p-8 text-xl text-[var(--luxury-ink)]">Loading order...</div>;
    }

    if (!order) {
        return <div className="bg-[var(--luxury-ivory)] p-8 text-xl text-[var(--luxury-ink)]">Order not found.</div>;
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-6 py-10 text-[var(--luxury-ink)]">
                <div className="mx-auto max-w-5xl">
                <button
                    onClick={() => router.push("/orders")}
                    className="mb-6 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)] hover:text-[var(--luxury-gold)]"
                >
                    ← Back to Orders
                </button>

                <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                    <div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
                                    Order Details
                                </p>

                                <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)]">
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

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
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
                        </section>
                    </div>

                    <section className="mt-8">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Items</h2>

                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid gap-4 border border-[#d8c8ad] bg-[#fffaf2] p-4 md:grid-cols-[96px_1fr_auto]"
                                >
                                    <div className="relative h-24 overflow-hidden bg-[#efe3d0]">
                                        {item.imageUrl && (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                fill
                                                className="object-contain p-3 drop-shadow-[0_16px_18px_rgba(22,18,13,0.14)]"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-medium">{item.productName}</p>

                                        <p className="text-sm text-[var(--luxury-muted)]">
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
                        <button
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            className="mt-6 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-red-700 disabled:bg-gray-400"
                        >
                            {cancelling ? "Cancelling..." : "Cancel Order"}
                        </button>
                    )}
                </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
