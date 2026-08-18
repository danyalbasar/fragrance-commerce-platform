"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { getVendorOrders, updateOrderStatus } from "@/services/orderService";
import { getApiResponse } from "@/services/api";
import { EmptyState } from "@/components/common/EmptyState";
import type { Order } from "@/types/order";
import { getStatusClasses } from "@/utils/orderStatus";
import { readCache, writeCache } from "@/utils/swrCache";

const orderStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

function currency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>(() =>
        readCache<Order[]>("vendor-orders") ?? []
    );
    const [loading, setLoading] = useState(
        () => readCache<Order[]>("vendor-orders") === null
    );
    const [statusForms, setStatusForms] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                setLoading(true);
                const data = await getVendorOrders();
                if (!active) return;
                setOrders(data);
                writeCache("vendor-orders", data);
                setStatusForms(
                    data.reduce<Record<string, string>>((acc, order) => {
                        acc[order.id] = order.status;
                        return acc;
                    }, {})
                );
            } catch {
                // handled
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, []);

    async function handleUpdateStatus(orderId: string) {
        setMessage("");
        setError("");
        const newStatus = statusForms[orderId];
        if (!newStatus) return;

        setUpdatingId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            setMessage("Order status updated.");
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
        } catch (err: unknown) {
            const response = getApiResponse(err);
            setError(
                typeof response?.data === "string"
                    ? response.data
                    : "Could not update order status."
            );
        } finally {
            setUpdatingId(null);
        }
    }

    const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                    Order Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    {orders.length} total orders
                </p>
            </div>

            {message && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Orders list */}
            <div className="space-y-4">
                {loading && orders.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-400">
                        Loading orders...
                    </div>
                ) : sortedOrders.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-10">
                        <EmptyState
                            icon={ClipboardList}
                            title="No orders yet"
                            description="Orders will appear here once customers place them."
                            actionLabel="Add Products"
                            actionHref="/vendor/products/new"
                            compact
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden rounded-xl border border-gray-200 bg-white md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-gray-500">
                                            <th className="px-5 py-3">Order</th>
                                            <th className="px-5 py-3">Date</th>
                                            <th className="px-5 py-3">Customer</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3 text-right">Total</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                <td className="px-5 py-3 font-medium text-gray-900">
                                                    #{order.orderNumber}
                                                </td>
                                                <td className="px-5 py-3 text-gray-500">
                                                    {formatDate(order.orderedAt)}
                                                </td>
                                                <td className="px-5 py-3 text-gray-500">
                                                    {order.shippingAddress.fullName}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <select
                                                        value={statusForms[order.id] || order.status}
                                                        onChange={(e) =>
                                                            setStatusForms((f) => ({
                                                                ...f,
                                                                [order.id]: e.target.value,
                                                            }))
                                                        }
                                                        className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs outline-none focus:border-gray-400"
                                                    >
                                                        {orderStatuses.map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-5 py-3 text-right font-medium text-gray-900">
                                                    {currency(order.finalAmount)}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(order.id)}
                                                            disabled={updatingId === order.id || (statusForms[order.id] || order.status) === order.status}
                                                            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
                                                        >
                                                            {updatingId === order.id ? "Saving..." : "Save"}
                                                        </button>
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            Details
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile cards */}
                        <div className="space-y-3 md:hidden">
                            {sortedOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-xl border border-gray-200 bg-white p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                #{order.orderNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(order.orderedAt)} · {order.shippingAddress.fullName}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            {currency(order.finalAmount)}
                                        </p>
                                    </div>

                                    <div className="mt-3 flex items-center gap-3">
                                        <select
                                            value={statusForms[order.id] || order.status}
                                            onChange={(e) =>
                                                setStatusForms((f) => ({
                                                    ...f,
                                                    [order.id]: e.target.value,
                                                }))
                                            }
                                            className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
                                        >
                                            {orderStatuses.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleUpdateStatus(order.id)}
                                            disabled={updatingId === order.id || (statusForms[order.id] || order.status) === order.status}
                                            className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
                                        >
                                            {updatingId === order.id ? "..." : "Save"}
                                        </button>
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
