"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    BarChart3,
    Boxes,
    ClipboardList,
    PackagePlus,
    ShieldCheck,
    TrendingUp,
    Truck,
} from "lucide-react";
import { getVendorDashboard } from "@/services/vendorService";
import { productService } from "@/services/productService";
import { getVendorOrders } from "@/services/orderService";
import { VendorDashboardSkeleton } from "@/components/common/VendorDashboardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import type { VendorDashboard } from "@/types/vendor";
import type { Product } from "@/types/product";
import type { Order } from "@/types/order";
import { readCache, writeCache } from "@/utils/swrCache";
import { getStatusClasses } from "@/utils/orderStatus";

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

export default function VendorDashboardPage() {
    const [dashboard, setDashboard] = useState<VendorDashboard | null>(() =>
        readCache<VendorDashboard>("vendor-dashboard")
    );
    const [products, setProducts] = useState<Product[]>(() =>
        readCache<Product[]>("vendor-products") ?? []
    );
    const [orders, setOrders] = useState<Order[]>(() =>
        readCache<Order[]>("vendor-orders") ?? []
    );
    const [loading, setLoading] = useState(
        () => readCache<VendorDashboard>("vendor-dashboard") === null
    );

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                setLoading(true);
                const [dash, prods, ords] = await Promise.all([
                    getVendorDashboard(),
                    productService.getVendorProducts(),
                    getVendorOrders().catch(() => []),
                ]);
                if (!active) return;
                setDashboard(dash);
                setProducts(prods);
                setOrders(ords);
                writeCache("vendor-dashboard", dash);
                writeCache("vendor-products", prods);
                writeCache("vendor-orders", ords);
            } catch {
                // handled by individual pages
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, []);

    if (loading && !dashboard) {
        return <VendorDashboardSkeleton />;
    }

    if (!dashboard) {
        return (
            <div className="py-20 text-center text-[var(--luxury-muted)]">
                Could not load dashboard data.
            </div>
        );
    }

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                    Vendor Studio
                </p>
                <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                    Welcome back
                </h1>
            </div>

            {/* Quick Actions */}
            <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">Quick Actions</h2>
                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        href="/vendor/products/new"
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] hover:bg-[var(--luxury-moss)] transition-colors"
                    >
                        <PackagePlus size={16} />
                        Add Product
                    </Link>
                    <Link
                        href="/vendor/products"
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--luxury-line)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-ink)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-colors"
                    >
                        <Boxes size={16} />
                        Manage Products
                    </Link>
                    <Link
                        href="/vendor/orders"
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--luxury-line)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-ink)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-colors"
                    >
                        <ClipboardList size={16} />
                        View Orders
                    </Link>
                </div>
            </section>

            {/* Metric cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<BarChart3 size={22} />}
                    label="Total Sales"
                    value={currency(dashboard.totalSalesAmount)}
                />
                <StatCard
                    icon={<Truck size={22} />}
                    label="Orders"
                    value={String(dashboard.totalOrders)}
                    sub={`${dashboard.pendingOrders} pending`}
                />
                <StatCard
                    icon={<Boxes size={22} />}
                    label="Products"
                    value={String(dashboard.totalProducts)}
                    sub={`${dashboard.lowStockProducts} low stock`}
                />
                <StatCard
                    icon={<ShieldCheck size={22} />}
                    label="Low Stock"
                    value={String(dashboard.lowStockProducts)}
                    highlight={dashboard.lowStockProducts > 0}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                {/* Order Flow */}
                <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                    <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                        Order Flow
                    </h2>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <MiniStat label="Pending" value={dashboard.pendingOrders} />
                        <MiniStat label="Confirmed" value={dashboard.confirmedOrders} />
                        <MiniStat label="Shipped" value={dashboard.shippedOrders} />
                        <MiniStat label="Delivered" value={dashboard.deliveredOrders} />
                        <MiniStat label="Cancelled" value={dashboard.cancelledOrders} />
                    </div>
                </section>

                {/* Top Sellers */}
                <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                    <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                        Top Sellers
                    </h2>
                    <div className="mt-5 space-y-4">
                        {dashboard.topSellingProducts.length === 0 ? (
                            <EmptyState
                                icon={TrendingUp}
                                title="No sales yet"
                                description="Delivered orders will appear here."
                                compact
                            />
                        ) : (
                            dashboard.topSellingProducts.map((p) => (
                                <div
                                    key={p.productId}
                                    className="flex items-center gap-4 border-b border-[#d8c8ad] pb-3 last:border-0 last:pb-0"
                                >
                                    {p.primaryImageUrl ? (
                                        <img
                                            src={p.primaryImageUrl}
                                            alt={p.productName}
                                            className="h-12 w-12 shrink-0 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[var(--luxury-sand)] text-[var(--luxury-muted)]">
                                            <TrendingUp size={18} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold">{p.productName}</p>
                                        <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                            {p.quantitySold} sold / {currency(p.revenue)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Recent Orders */}
            <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                <div className="flex items-center justify-between border-b border-[#d8c8ad] px-6 py-4">
                    <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">Recent Orders</h2>
                    <Link
                        href="/vendor/orders"
                        className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-gold)]"
                    >
                        View all
                    </Link>
                </div>
                {recentOrders.length === 0 ? (
                    <div className="p-6">
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#d8c8ad] bg-[var(--luxury-sand)] text-xs uppercase tracking-[0.18em] text-[var(--luxury-muted-strong)]">
                                    <th className="px-6 py-3 font-semibold">Order</th>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 text-right font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-[#d8c8ad] last:border-0 hover:bg-[var(--luxury-sand)]/50">
                                        <td className="px-6 py-3 font-medium">
                                            #{order.orderNumber}
                                        </td>
                                        <td className="px-6 py-3 text-[var(--luxury-muted)]">
                                            {formatDate(order.orderedAt)}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-semibold">
                                            {currency(order.finalAmount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    sub,
    highlight,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    highlight?: boolean;
}) {
    return (
        <div className={`border bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6 ${highlight ? "border-[var(--luxury-gold)]" : "border-[#d8c8ad]"}`}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8ad] text-[var(--luxury-gold)]">
                {icon}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--luxury-muted)] sm:tracking-[0.28em]">
                {label}
            </p>
            <p className="mt-2 text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                {value}
            </p>
            {sub && (
                <p className="mt-1 text-xs text-[var(--luxury-muted)]">{sub}</p>
            )}
        </div>
    );
}

function MiniStat({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="border border-[#d8c8ad] bg-[var(--luxury-sand)] p-3 text-center">
            <p className="text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[var(--luxury-muted)]">{label}</p>
        </div>
    );
}
