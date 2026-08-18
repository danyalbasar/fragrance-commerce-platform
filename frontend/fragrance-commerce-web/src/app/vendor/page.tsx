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
            <div className="py-20 text-center text-gray-500">
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
                <p className="text-sm font-medium text-gray-500">Overview</p>
                <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                    Welcome back
                </h1>
            </div>

            {/* Metric cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<BarChart3 size={20} />}
                    label="Total Sales"
                    value={currency(dashboard.totalSalesAmount)}
                />
                <StatCard
                    icon={<Truck size={20} />}
                    label="Orders"
                    value={String(dashboard.totalOrders)}
                    sub={`${dashboard.pendingOrders} pending`}
                />
                <StatCard
                    icon={<Boxes size={20} />}
                    label="Products"
                    value={String(dashboard.totalProducts)}
                    sub={`${dashboard.lowStockProducts} low stock`}
                />
                <StatCard
                    icon={<ShieldCheck size={20} />}
                    label="Low Stock"
                    value={String(dashboard.lowStockProducts)}
                    highlight={dashboard.lowStockProducts > 0}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                {/* Order Flow */}
                <section className="rounded-xl border border-gray-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Order Flow
                    </h2>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <MiniStat label="Pending" value={dashboard.pendingOrders} color="text-amber-600" />
                        <MiniStat label="Confirmed" value={dashboard.confirmedOrders} color="text-blue-600" />
                        <MiniStat label="Shipped" value={dashboard.shippedOrders} color="text-purple-600" />
                        <MiniStat label="Delivered" value={dashboard.deliveredOrders} color="text-green-600" />
                        <MiniStat label="Cancelled" value={dashboard.cancelledOrders} color="text-red-500" />
                    </div>
                </section>

                {/* Top Sellers */}
                <section className="rounded-xl border border-gray-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
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
                                    className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{p.productName}</p>
                                        <p className="text-xs text-gray-500">{p.quantitySold} sold</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {currency(p.revenue)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Recent Orders */}
            <section className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                    <Link
                        href="/vendor/orders"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
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
                                <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-3">Order</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            #{order.orderNumber}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {formatDate(order.orderedAt)}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-medium text-gray-900">
                                            {currency(order.finalAmount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Quick Actions */}
            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        href="/vendor/products/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                    >
                        <PackagePlus size={16} />
                        Add Product
                    </Link>
                    <Link
                        href="/vendor/products"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Boxes size={16} />
                        Manage Products
                    </Link>
                    <Link
                        href="/vendor/orders"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <ClipboardList size={16} />
                        View Orders
                    </Link>
                </div>
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
        <div className={`rounded-xl border bg-white p-5 ${highlight ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}>
            <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${highlight ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"}`}>
                {icon}
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            {sub && (
                <p className="mt-1 text-xs text-gray-500">{sub}</p>
            )}
        </div>
    );
}

function MiniStat({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs font-medium text-gray-500">{label}</p>
        </div>
    );
}
