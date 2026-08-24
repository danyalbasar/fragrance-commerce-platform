"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { getVendorOrders, updateOrderStatus } from "@/services/orderService";
import { getApiResponse } from "@/services/api";
import { EmptyState } from "@/components/common/EmptyState";
import { VendorOrdersSkeleton } from "@/components/common/VendorSkeletons";
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                    Vendor Studio
                </p>
                <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                    Orders
                </h1>
                <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                    {orders.length} total orders
                </p>
            </div>

            {message && (
                <div className="border border-[#b9c8a8] bg-[#f6fbef] p-4 text-sm text-[#455c2b]">
                    {message}
                </div>
            )}

            {error && (
                <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Orders list */}
            <div className="space-y-4">
                {loading && orders.length === 0 ? (
                    <VendorOrdersSkeleton />
                ) : sortedOrders.length === 0 ? (
                    <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-10 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
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
                        <div className="hidden border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)] md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[#d8c8ad] bg-[var(--luxury-sand)] text-xs uppercase tracking-[0.18em] text-[var(--luxury-muted-strong)]">
                                            <th className="px-5 py-4 font-semibold">Order</th>
                                            <th className="px-5 py-4 font-semibold">Date</th>
                                            <th className="px-5 py-4 font-semibold">Customer</th>
                                            <th className="px-5 py-4 font-semibold">Status</th>
                                            <th className="px-5 py-4 text-right font-semibold">Total</th>
                                            <th className="px-5 py-4 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-[#d8c8ad] last:border-0 hover:bg-[var(--luxury-sand)]/50">
                                                <td className="px-5 py-4 font-semibold">
                                                    #{order.orderNumber}
                                                </td>
                                                <td className="px-5 py-4 text-[var(--luxury-muted)]">
                                                    {formatDate(order.orderedAt)}
                                                </td>
                                                <td className="px-5 py-4 text-[var(--luxury-muted)]">
                                                    {order.shippingAddress.fullName}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <select
                                                        value={statusForms[order.id] || order.status}
                                                        onChange={(e) =>
                                                            setStatusForms((f) => ({
                                                                ...f,
                                                                [order.id]: e.target.value,
                                                            }))
                                                        }
                                                        className="h-9 border border-[#d8c8ad] bg-[var(--luxury-input)] px-2 text-xs outline-none focus:border-[var(--luxury-gold)]"
                                                    >
                                                        {orderStatuses.map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-5 py-4 text-right font-semibold">
                                                    {currency(order.finalAmount)}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(order.id)}
                                                            disabled={updatingId === order.id || (statusForms[order.id] || order.status) === order.status}
                                                            className="rounded-full bg-[var(--luxury-ink)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] hover:bg-[var(--luxury-moss)] disabled:opacity-40 transition-colors"
                                                        >
                                                            {updatingId === order.id ? "Saving..." : "Save"}
                                                        </button>
                                                        <Link
                                                            href={`/vendor/orders/${order.id}`}
                                                            className="rounded-full border border-[#d8c8ad] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] hover:border-[var(--luxury-gold)] transition-colors"
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
                                    className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-4 shadow-[0_18px_50px_rgba(22,18,13,0.08)]"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">
                                                #{order.orderNumber}
                                            </p>
                                            <p className="text-xs text-[var(--luxury-muted)]">
                                                {formatDate(order.orderedAt)} · {order.shippingAddress.fullName}
                                            </p>
                                        </div>
                                        <p className="font-semibold">
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
                                            className="flex-1 h-11 border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 text-sm outline-none focus:border-[var(--luxury-gold)]"
                                        >
                                            {orderStatuses.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleUpdateStatus(order.id)}
                                            disabled={updatingId === order.id || (statusForms[order.id] || order.status) === order.status}
                                            className="rounded-full bg-[var(--luxury-ink)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] hover:bg-[var(--luxury-moss)] disabled:opacity-40 transition-colors"
                                        >
                                            {updatingId === order.id ? "..." : "Save"}
                                        </button>
                                        <Link
                                            href={`/vendor/orders/${order.id}`}
                                            className="rounded-full border border-[#d8c8ad] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] hover:border-[var(--luxury-gold)] transition-colors"
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
