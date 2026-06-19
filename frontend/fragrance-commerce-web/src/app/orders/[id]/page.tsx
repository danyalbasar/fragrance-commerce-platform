"use client";

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
        return <div className="p-8 text-xl">Loading order...</div>;
    }

    if (!order) {
        return <div className="p-8 text-xl">Order not found.</div>;
    }

    return (
        <ProtectedRoute>
            <main className="mx-auto max-w-5xl p-8">
                <button
                    onClick={() => router.push("/orders")}
                    className="mb-6 text-sm text-gray-600 hover:text-black"
                >
                    ← Back to Orders
                </button>

                <div className="rounded-xl border bg-white p-6">
                    <div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">
                                    Order #{order.orderNumber}
                                </h1>

                                <p className="mt-2 text-sm text-gray-500">
                                    {new Date(order.orderedAt).toLocaleString()}
                                </p>
                            </div>

                            <span
                                className={`w-fit rounded-full px-3 py-1 text-sm ${getStatusClasses(
                                    order.status
                                )}`}
                            >
                                {order.status}
                            </span>
                        </div>

                        {order.status === "Cancelled" ? (
                            <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
                                This order has been cancelled.
                            </div>
                        ) : (
                            <OrderTimeline currentStatus={order.status} />
                        )}
                    </div>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-3 text-lg font-semibold">
                                Shipping Address
                            </h2>

                            <p className="font-medium">{order.shippingAddress.fullName}</p>

                            <p className="mt-2 text-sm text-gray-600">
                                {order.shippingAddress.addressLine1}
                                {order.shippingAddress.addressLine2 &&
                                    `, ${order.shippingAddress.addressLine2}`}
                            </p>

                            <p className="text-sm text-gray-600">
                                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                                {order.shippingAddress.postalCode}
                            </p>

                            <p className="text-sm text-gray-600">
                                {order.shippingAddress.country}
                            </p>

                            <p className="mt-2 text-sm text-gray-600">
                                Phone: {order.shippingAddress.phoneNumber}
                            </p>
                        </section>

                        <section className="rounded-lg border p-4">
                            <h2 className="mb-3 text-lg font-semibold">Payment</h2>

                            <p className="text-sm text-gray-600">
                                Method: {order.payment.paymentMethod}
                            </p>

                            <p className="text-sm text-gray-600">
                                Status: {order.payment.paymentStatus}
                            </p>

                            <p className="text-sm text-gray-600">
                                Amount: ₹{order.payment.amount}
                            </p>

                            {order.payment.transactionId && (
                                <p className="text-sm text-gray-600">
                                    Transaction ID: {order.payment.transactionId}
                                </p>
                            )}
                        </section>
                    </div>

                    <section className="mt-8">
                        <h2 className="mb-4 text-lg font-semibold">Items</h2>

                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between rounded-lg border p-4"
                                >
                                    <div>
                                        <p className="font-medium">{item.productName}</p>

                                        <p className="text-sm text-gray-500">
                                            {item.variantName} × {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-semibold">₹{item.totalPrice}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 rounded-lg border p-4">
                        <div className="flex justify-between">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
                        </div>

                        <div className="mt-2 flex justify-between">
                            <span>Discount</span>
                            <span>₹{order.discountAmount}</span>
                        </div>

                        <div className="mt-4 flex justify-between text-xl font-bold">
                            <span>Final Amount</span>
                            <span>₹{order.finalAmount}</span>
                        </div>
                    </section>

                    {order.status !== "Cancelled" && order.status !== "Delivered" && (
                        <button
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            className="mt-6 rounded-full bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600 disabled:bg-gray-400"
                        >
                            {cancelling ? "Cancelling..." : "Cancel Order"}
                        </button>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}