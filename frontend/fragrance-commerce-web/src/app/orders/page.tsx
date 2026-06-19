"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import type { Order } from "@/types/order";
import { getOrders } from "@/services/orderService";
import Link from "next/link";
import { getStatusClasses } from "@/utils/orderStatus";
import { useAuth } from "@/contexts/AuthContext";

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

    useEffect(() => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        loadOrders();
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return (
            <ProtectedRoute>
                <div />
            </ProtectedRoute>
        );
    }

    if (loading) {
        return <div className="p-8 text-xl">Loading orders...</div>;
    }

    return (
        <ProtectedRoute>
            <main className="mx-auto max-w-6xl p-8">
                <h1 className="mb-8 text-4xl font-bold">My Orders</h1>

                {orders.length === 0 ? (
                    <p>You have not placed any orders yet.</p>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block rounded-xl border bg-white p-6 transition hover:border-black hover:shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Order #{order.orderNumber}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            {new Date(order.orderedAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm ${getStatusClasses(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between text-sm"
                                        >
                                            <span>
                                                {item.productName} ({item.variantName}) ×{" "}
                                                {item.quantity}
                                            </span>

                                            <span>₹{item.totalPrice}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 border-t pt-4 flex justify-between text-lg font-bold">
                                    <span>Final Amount</span>
                                    <span>₹{order.finalAmount}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}