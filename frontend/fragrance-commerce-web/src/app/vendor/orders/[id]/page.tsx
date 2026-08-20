"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getVendorOrders } from "@/services/orderService";
import { EmptyState } from "@/components/common/EmptyState";
import type { Order } from "@/types/order";
import { getStatusClasses } from "@/utils/orderStatus";
import { readCache, writeCache } from "@/utils/swrCache";

function currency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export default function VendorOrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(() => {
        const cached = readCache<Order[]>("vendor-orders");
        return cached?.find((o) => o.id === orderId) ?? null;
    });
    const [loading, setLoading] = useState(order === null);

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                setLoading(true);
                let orders = readCache<Order[]>("vendor-orders");
                if (!orders) {
                    orders = await getVendorOrders();
                    writeCache("vendor-orders", orders);
                }
                if (!active) return;
                setOrder(orders.find((o) => o.id === orderId) ?? null);
            } catch {
                if (active) setOrder(null);
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, [orderId]);

    if (loading && !order) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="h-8 w-48 rounded bg-gray-200" />
                <div className="h-64 rounded-xl border border-gray-200 bg-white" />
            </div>
        );
    }

    if (!order) {
        return (
            <div>
                <Link
                    href="/vendor/orders"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft size={14} />
                    Back to Orders
                </Link>
                <EmptyState
                    icon={ArrowLeft}
                    title="Order not found"
                    description="This order may no longer be available."
                    actionLabel="Back to Orders"
                    actionHref="/vendor/orders"
                    compact
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back link */}
            <Link
                href="/vendor/orders"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
            >
                <ArrowLeft size={14} />
                Back to Orders
            </Link>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">Order Details</p>
                    <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                        #{order.orderNumber}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {new Date(order.orderedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(order.status)}`}>
                    {order.status}
                </span>
            </div>

            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="text-sm font-medium text-gray-500">Shipping Address</h2>
                    <div className="mt-3 space-y-1 text-sm text-gray-900">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="text-gray-500">Phone: {order.shippingAddress.phoneNumber}</p>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="text-sm font-medium text-gray-500">Payment</h2>
                    <div className="mt-3 space-y-1 text-sm text-gray-900">
                        <p>Method: <span className="font-medium">{order.payment.paymentMethod}</span></p>
                        <p>Status: <span className="font-medium">{order.payment.paymentStatus}</span></p>
                        <p>Amount: <span className="font-medium">{currency(order.payment.amount)}</span></p>
                        {order.payment.transactionId && (
                            <p className="text-gray-500">Txn: {order.payment.transactionId}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-3">
                    <h2 className="text-sm font-medium text-gray-900">Items</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {item.imageUrl && (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                <p className="text-xs text-gray-500">{item.variantName} · Qty {item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{currency(item.totalPrice)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{currency(order.totalAmount)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-{currency(order.discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
                        <span>Total</span>
                        <span>{currency(order.finalAmount)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
