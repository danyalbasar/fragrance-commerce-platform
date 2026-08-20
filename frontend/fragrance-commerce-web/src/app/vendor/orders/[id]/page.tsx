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
            <div className="space-y-6">
                <div className="h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-10 w-48 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-64 border border-[#d8c8ad] bg-[var(--luxury-paper)] animate-pulse" />
            </div>
        );
    }

    if (!order) {
        return (
            <div>
                <Link
                    href="/vendor/orders"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--luxury-muted)] hover:text-[var(--luxury-gold-strong)]"
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
                className="inline-flex items-center gap-1.5 text-sm text-[var(--luxury-muted)] hover:text-[var(--luxury-gold-strong)]"
            >
                <ArrowLeft size={14} />
                Back to Orders
            </Link>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                        Order Details
                    </p>
                    <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                        #{order.orderNumber}
                    </h1>
                    <p className="mt-2 text-sm text-[var(--luxury-muted)]">
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
                <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Shipping Address</h2>
                    <div className="mt-3 space-y-1 text-sm">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p className="text-[var(--luxury-muted)]">{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}</p>
                        <p className="text-[var(--luxury-muted)]">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                        <p className="text-[var(--luxury-muted)]">{order.shippingAddress.country}</p>
                        <p className="text-[var(--luxury-muted)]">Phone: {order.shippingAddress.phoneNumber}</p>
                    </div>
                </div>

                <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Payment</h2>
                    <div className="mt-3 space-y-1 text-sm">
                        <p className="text-[var(--luxury-muted)]">Method: <span className="font-medium text-[var(--luxury-ink)]">{order.payment.paymentMethod}</span></p>
                        <p className="text-[var(--luxury-muted)]">Status: <span className="font-medium text-[var(--luxury-ink)]">{order.payment.paymentStatus}</span></p>
                        <p className="text-[var(--luxury-muted)]">Amount: <span className="font-medium text-[var(--luxury-ink)]">{currency(order.payment.amount)}</span></p>
                        {order.payment.transactionId && (
                            <p className="text-[var(--luxury-muted)]">Txn: {order.payment.transactionId}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                <div className="border-b border-[#d8c8ad] px-5 py-4">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Items</h2>
                </div>
                <div className="divide-y divide-[#d8c8ad]">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-[var(--luxury-sand)]">
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
                                <p className="font-semibold truncate">{item.productName}</p>
                                <p className="text-xs text-[var(--luxury-muted)]">{item.variantName} · Qty {item.quantity}</p>
                            </div>
                            <p className="font-semibold">{currency(item.totalPrice)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[var(--luxury-muted)]">
                        <span>Subtotal</span>
                        <span>{currency(order.totalAmount)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                        <div className="flex justify-between text-[#455c2b]">
                            <span>Discount</span>
                            <span>-{currency(order.discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t border-[#d8c8ad] pt-2 text-base font-semibold">
                        <span>Total</span>
                        <span>{currency(order.finalAmount)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
