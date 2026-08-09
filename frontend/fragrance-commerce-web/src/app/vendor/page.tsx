"use client";

import Image from "next/image";
import Link from "next/link";
import {
    BarChart3,
    Boxes,
    ChevronUp,
    ClipboardList,
    PanelLeftClose,
    PanelLeftOpen,
    PackagePlus,
    Search,
    ShieldCheck,
    Store,
    Truck,
    UserCircle,
    TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getApiResponse } from "@/services/api";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { VendorDashboardSkeleton } from "@/components/common/VendorDashboardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { getVendorOrders, updateOrderStatus } from "@/services/orderService";
import { productService } from "@/services/productService";
import {
    createVendor,
    getVendorDashboard,
} from "@/services/vendorService";
import type { Order } from "@/types/order";
import type { Product } from "@/types/product";
import type { VendorDashboard } from "@/types/vendor";
import { getStatusClasses } from "@/utils/orderStatus";
import { readCache, writeCache } from "@/utils/swrCache";

type VendorTab = "overview" | "products" | "orders" | "profile";

const tabTitles: Record<VendorTab, string> = {
    overview: "Overview",
    products: "Products",
    orders: "Orders",
    profile: "Profile",
};

const orderStatuses = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
];

export default function VendorPage() {
    const [activeTab, setActiveTab] = useState<VendorTab>("products");
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
        () =>
            readCache<Product[]>("vendor-products") === null ||
            readCache<VendorDashboard>("vendor-dashboard") === null
    );
    const [needsProfile, setNeedsProfile] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [orderStatusForms, setOrderStatusForms] = useState<Record<string, string>>({});
    const [showProductSearch, setShowProductSearch] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [productSearch, setProductSearch] = useState({
        name: "",
        sku: "",
        category: "",
        gender: "",
        status: "",
        stock: "",
    });
    const [profileForm, setProfileForm] = useState({
        businessName: "",
        gstNumber: "",
        address: "",
    });

    const lowStockCount = useMemo(
        () =>
            products.filter((product) =>
                product.variants.some(
                    (variant) =>
                        variant.stockQuantity > 0 &&
                        variant.stockQuantity <= 5
                )
            ).length,
        [products]
    );

    const productCategoryOptions = useMemo(
        () =>
            Array.from(new Set(products.map((product) => product.categoryName)))
                .filter(Boolean)
                .sort(),
        [products]
    );

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const searchName = productSearch.name.trim().toLowerCase();
            const searchSku = productSearch.sku.trim().toLowerCase();
            const stock = totalStock(product);

            if (
                searchName &&
                !product.name.toLowerCase().includes(searchName) &&
                !product.brandName?.toLowerCase().includes(searchName)
            ) {
                return false;
            }

            if (
                searchSku &&
                !product.variants.some((variant) =>
                    variant.sku.toLowerCase().includes(searchSku)
                )
            ) {
                return false;
            }

            if (productSearch.category && product.categoryName !== productSearch.category) {
                return false;
            }

            if (productSearch.gender && product.gender !== productSearch.gender) {
                return false;
            }

            if (productSearch.status) {
                const isActive = productSearch.status === "Active";
                if (product.isActive !== isActive) return false;
            }

            if (productSearch.stock === "Low" && stock > 5) return false;
            if (productSearch.stock === "Out" && stock !== 0) return false;

            return true;
        });
    }, [products, productSearch]);

    async function loadVendorArea() {
        try {
            setLoading(true);
            setError("");
            setNeedsProfile(false);

            const [dashboardData, productData, orderData] = await Promise.all([
                getVendorDashboard(),
                productService.getVendorProducts(),
                getVendorOrders().catch(() => []),
            ]);

            setDashboard(dashboardData);
            setProducts(productData);
            setOrders(orderData);
            writeCache("vendor-dashboard", dashboardData);
            writeCache("vendor-products", productData);
            writeCache("vendor-orders", orderData);
            setOrderStatusForms(
                orderData.reduce<Record<string, string>>((forms, order) => {
                    forms[order.id] = order.status;
                    return forms;
                }, {})
            );
        } catch (err: unknown) {
            const response = getApiResponse(err);
            const responseText =
                typeof response?.data === "string" ? response.data : "";

            if (
                response?.status === 400 &&
                responseText.toLowerCase().includes("vendor profile")
            ) {
                setNeedsProfile(true);
                setActiveTab("profile");
            } else if (response?.status === 401 || response?.status === 403) {
                setError("Sign in with a vendor account to open Vendor Studio.");
            } else {
                setError("Vendor Studio could not be loaded.");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(loadVendorArea, 0);
        return () => window.clearTimeout(timer);
    }, []);

    function currency(value: number) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value || 0);
    }

    function primaryImage(product: Product) {
        return (
            product.images.find((image) => image.isPrimary)?.imageUrl ||
            product.images[0]?.imageUrl ||
            product.variants[0]?.images[0]?.imageUrl ||
            ""
        );
    }

    function totalStock(product: Product) {
        return product.variants.reduce(
            (total, variant) => total + variant.stockQuantity,
            0
        );
    }

    function firstPrice(product: Product) {
        return product.variants[0]?.sellingPrice || 0;
    }

    async function handleCreateVendor(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await createVendor(profileForm);
            setNeedsProfile(false);
            setMessage("Vendor profile created. Log in again to refresh your vendor access.");
        } catch (err: unknown) {
            const response = getApiResponse(err);
            setError(
                typeof response?.data === "string"
                    ? response.data
                    : "Vendor profile could not be created."
            );
        }
    }

    async function handleOrderStatus(orderId: string, status: string) {
        setMessage("");
        setError("");

        try {
            await updateOrderStatus(orderId, status);
            setMessage("Order status updated.");
            await loadVendorArea();
        } catch (err: unknown) {
            const response = getApiResponse(err);
            setError(
                typeof response?.data === "string"
                    ? response.data
                    : "Order status could not be updated."
            );
        }
    }

    if (loading && products.length === 0) {
        return (
            <ProtectedRoute>
                <VendorDashboardSkeleton />
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] text-[var(--luxury-ink)]">
                <div
                    className={
                        sidebarCollapsed
                            ? "grid min-h-screen lg:grid-cols-[88px_1fr]"
                            : "grid min-h-screen lg:grid-cols-[270px_1fr]"
                    }
                >
                    <aside className="min-w-0 overflow-hidden border-b border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-4 transition-all sm:px-5 sm:py-6 lg:border-b-0 lg:border-r">
                        <div
                            className={
                                sidebarCollapsed
                                    ? "flex justify-center"
                                    : "flex items-start justify-between gap-3"
                            }
                        >
                            {!sidebarCollapsed && (
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-strong)]">
                                        Vendor
                                    </p>
                                    <Link
                                        href="/vendor"
                                        className="-my-1 py-1 mt-2 block truncate text-2xl font-semibold tracking-[0.04em] [font-family:var(--font-serif)]"
                                    >
                                        Dashboard
                                    </Link>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setSidebarCollapsed((value) => !value)}
                                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8c8ad] bg-[var(--luxury-ivory)] text-[var(--luxury-ink)] transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] lg:flex"
                                aria-label={sidebarCollapsed ? "Expand dashboard menu" : "Collapse dashboard menu"}
                                title={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
                            >
                                {sidebarCollapsed ? (
                                    <PanelLeftOpen size={18} />
                                ) : (
                                    <PanelLeftClose size={18} />
                                )}
                            </button>
                        </div>

                        {!sidebarCollapsed && (
                            <div className="mt-6">
                                <label className="flex h-11 items-center gap-3 border border-[#d8c8ad] bg-[#fffaf2] px-3 text-sm text-[var(--luxury-muted)]">
                                    <Search size={18} />
                                    <input
                                        value={productSearch.name}
                                        onChange={(e) =>
                                            setProductSearch((current) => ({
                                                ...current,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Search"
                                        aria-label="Search products"
                                        className="w-full bg-transparent outline-none"
                                    />
                                </label>
                            </div>
                        )}

                        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-7 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
                            {([
                                ["overview", "Overview", BarChart3],
                                ["products", "Products", Boxes],
                                ["orders", "Orders", ClipboardList],
                                ["profile", "Profile", UserCircle],
                            ] as Array<[VendorTab, string, typeof BarChart3]>).map(([tab, label, Icon]) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    aria-current={activeTab === tab ? "page" : undefined}
                                    className={
                                        activeTab === tab
                                            ? `flex shrink-0 items-center gap-2 border border-[var(--luxury-ink)] bg-[var(--luxury-ink)] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--luxury-paper)] transition-all duration-200 active:scale-[0.97] sm:gap-3 sm:px-4 sm:py-3 sm:text-sm sm:tracking-[0.12em] lg:w-full ${sidebarCollapsed ? "lg:justify-center" : ""}`
                                            : `flex shrink-0 items-center gap-2 border border-[#d8c8ad] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--luxury-muted)] transition-all duration-200 hover:border-[#d8c8ad] hover:bg-[#f6ead2] hover:text-[var(--luxury-ink)] active:scale-[0.97] sm:gap-3 sm:px-4 sm:py-3 sm:text-sm sm:tracking-[0.12em] lg:w-full lg:border-transparent ${sidebarCollapsed ? "lg:justify-center" : ""}`
                                    }
                                    title={label}
                                >
                                    <Icon size={18} />
                                    <span className={sidebarCollapsed ? "lg:hidden" : ""}>{label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <section className="min-w-0 px-4 py-6 md:px-8 md:py-8">
                    <header className="mb-6 grid gap-5 border-b border-[#d8c8ad] pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                                Vendor Studio
                            </p>
                            <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                                {tabTitles[activeTab]}
                            </h1>
                        </div>

                        {activeTab === "products" && (
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href="/vendor/products/new"
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition-all duration-200 hover:bg-[var(--luxury-moss)] active:scale-[0.98] sm:w-auto sm:tracking-[0.14em]"
                                >
                                    <PackagePlus size={16} />
                                    Add Product
                                </Link>
                            </div>
                        )}
                    </header>

                    {message && (
                        <div className="mb-6 border border-[#b9c8a8] bg-[#f6fbef] p-4 text-sm text-[#455c2b]">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {needsProfile ? (
                        <ProfilePanel
                            profileForm={profileForm}
                            setProfileForm={setProfileForm}
                            onSubmit={handleCreateVendor}
                        />
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {activeTab === "overview" && dashboard && (
                                <section className="space-y-8">
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <MetricCard
                                            icon={<BarChart3 size={22} />}
                                            label="Sales"
                                            value={currency(dashboard.totalSalesAmount)}
                                        />
                                        <MetricCard
                                            icon={<Truck size={22} />}
                                            label="Orders"
                                            value={String(dashboard.totalOrders)}
                                        />
                                        <MetricCard
                                            icon={<Boxes size={22} />}
                                            label="Products"
                                            value={String(dashboard.totalProducts)}
                                        />
                                        <MetricCard
                                            icon={<ShieldCheck size={22} />}
                                            label="Low Stock"
                                            value={String(dashboard.lowStockProducts)}
                                        />
                                    </div>

                                    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                                        <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6">
                                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                                Order Flow
                                            </h2>
                                            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                                <StatusCount label="Pending" value={dashboard.pendingOrders} />
                                                <StatusCount label="Confirmed" value={dashboard.confirmedOrders} />
                                                <StatusCount label="Shipped" value={dashboard.shippedOrders} />
                                                <StatusCount label="Delivered" value={dashboard.deliveredOrders} />
                                                <StatusCount label="Cancelled" value={dashboard.cancelledOrders} />
                                            </div>
                                        </section>

                                        <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6">
                                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                                Top Sellers
                                            </h2>
                                            <div className="mt-5 space-y-4">
                                                {dashboard.topSellingProducts.length === 0 ? (
                                                    <EmptyState
                                                        icon={TrendingUp}
                                                        title="No sales yet"
                                                        description="Delivered sales will appear here."
                                                        actionLabel="View Orders"
                                                        onAction={() => setActiveTab("orders")}
                                                        compact
                                                    />
                                                ) : (
                                                    dashboard.topSellingProducts.map((product) => (
                                                        <div
                                                            key={product.productId}
                                                            className="border-b border-[#d8c8ad] pb-4 last:border-b-0 last:pb-0"
                                                        >
                                                            <p className="font-semibold">{product.productName}</p>
                                                            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                                                {product.quantitySold} sold / {currency(product.revenue)}
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                </section>
                            )}

                            {activeTab === "products" && (
                                <section className="space-y-6">
                                    <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                                        <button
                                            type="button"
                                            onClick={() => setShowProductSearch((value) => !value)}
                                            className="flex w-full items-center justify-between border-b border-[#d8c8ad] px-4 py-4 text-left sm:px-6 sm:py-5"
                                        >
                                            <span className="flex items-center gap-3 text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                                <Search size={22} />
                                                Search
                                            </span>
                                            <ChevronUp
                                                size={22}
                                                className={`transition ${showProductSearch ? "" : "rotate-180"}`}
                                            />
                                        </button>

                                        {showProductSearch && (
                                            <div className="grid gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-2">
                                                <Field
                                                    label="Product Name"
                                                    value={productSearch.name}
                                                    onChange={(value) =>
                                                        setProductSearch((current) => ({
                                                            ...current,
                                                            name: value,
                                                        }))
                                                    }
                                                />
                                                <Field
                                                    label="Variant SKU"
                                                    value={productSearch.sku}
                                                    onChange={(value) =>
                                                        setProductSearch((current) => ({
                                                            ...current,
                                                            sku: value,
                                                        }))
                                                    }
                                                />
                                                <SelectField
                                                    label="Category"
                                                    value={productSearch.category}
                                                    onChange={(value) =>
                                                        setProductSearch((current) => ({
                                                            ...current,
                                                            category: value,
                                                        }))
                                                    }
                                                    options={[
                                                        { value: "", label: "All" },
                                                        ...productCategoryOptions.map((category) => ({
                                                            value: category,
                                                            label: category,
                                                        })),
                                                    ]}
                                                />
                                                <SelectField
                                                    label="Gender"
                                                    value={productSearch.gender}
                                                    onChange={(value) =>
                                                        setProductSearch((current) => ({
                                                            ...current,
                                                            gender: value,
                                                        }))
                                                    }
                                                    options={[
                                                        { value: "", label: "All" },
                                                        { value: "Men", label: "Men" },
                                                        { value: "Women", label: "Women" },
                                                        { value: "Unisex", label: "Unisex" },
                                                    ]}
                                                />
                                                <SelectField
                                                    label="Published"
                                                    value={productSearch.status}
                                                    onChange={(value) =>
                                                        setProductSearch((current) => ({
                                                            ...current,
                                                            status: value,
                                                        }))
                                                    }
                                                    options={[
                                                        { value: "", label: "All" },
                                                        { value: "Active", label: "Active" },
                                                        { value: "Inactive", label: "Inactive" },
                                                    ]}
                                                />
                                                <SelectField
                                                    label="Stock"
                                                    value={productSearch.stock}
                                                    onChange={(value) =>
                                                        setProductSearch((current) => ({
                                                            ...current,
                                                            stock: value,
                                                        }))
                                                    }
                                                    options={[
                                                        { value: "", label: "All" },
                                                        { value: "Low", label: "Low Stock" },
                                                        { value: "Out", label: "Out of Stock" },
                                                    ]}
                                                />

                                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-2 lg:justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setProductSearch({
                                                                name: "",
                                                                sku: "",
                                                                category: "",
                                                                gender: "",
                                                                status: "",
                                                                stock: "",
                                                            })
                                                        }
                                                        className="inline-flex h-12 min-w-0 items-center justify-center rounded-full border border-[#d8c8ad] px-6 text-sm font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold)] sm:min-w-36 sm:tracking-[0.14em]"
                                                    >
                                                        Reset
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                                        <div className="border-b border-[#d8c8ad] px-4 py-4 sm:px-6 sm:py-5">
                                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                                Product List
                                            </h2>
                                            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                                Showing {filteredProducts.length} of {products.length} products / {lowStockCount} low stock
                                            </p>
                                        </div>

                                        {filteredProducts.length === 0 ? (
                                            <div className="p-4 sm:p-6">
                                                <EmptyState
                                                    icon={Boxes}
                                                    title="No products found"
                                                    description="Try adjusting your search, or add your first product to the house."
                                                    actionLabel="Add Product"
                                                    actionHref="/vendor/products/new"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                        <div className="grid gap-4 p-4 md:hidden">
                                            {filteredProducts.map((product) => (
                                                <article
                                                    key={product.id}
                                                    className="border border-[#d8c8ad] bg-[#fffaf2] p-4"
                                                >
                                                    <div className="grid grid-cols-[88px_1fr] gap-4">
                                                        <div className="relative h-24 overflow-hidden bg-[#efe3d0]">
                                                            {primaryImage(product) && (
                                                                <Image
                                                                    src={primaryImage(product)}
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-gold-strong)]">
                                                                {product.brandName}
                                                            </p>
                                                            <h3 className="mt-1 break-words text-xl font-normal leading-tight [font-family:var(--font-serif)]">
                                                                {product.name}
                                                            </h3>
                                                            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                                                {product.gender} / {product.categoryName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 grid grid-cols-3 gap-3 border-y border-[#d8c8ad] py-3 text-sm">
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--luxury-muted)]">SKU</p>
                                                            <p className="mt-1 truncate font-semibold">{product.variants[0]?.sku || "-"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--luxury-muted)]">Stock</p>
                                                            <p className="mt-1 font-semibold">{totalStock(product)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--luxury-muted)]">Price</p>
                                                            <p className="mt-1 font-semibold">{currency(firstPrice(product))}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-between gap-3">
                                                        <span className={product.isActive ? "text-sm font-semibold text-[#516b2f]" : "text-sm font-semibold text-[var(--luxury-muted)]"}>
                                                            {product.isActive ? "Published" : "Draft"}
                                                        </span>
                                                        <Link
                                                            href={`/vendor/products/${product.id}`}
                                                            className="inline-flex h-10 items-center justify-center rounded-full border border-[#d8c8ad] px-5 text-xs font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold)]"
                                                        >
                                                            Edit
                                                        </Link>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>

                                        <div className="hidden overflow-x-auto md:block">
                                            <table className="w-full min-w-[1040px] border-collapse text-left">
                                                <thead className="border-b border-[#d8c8ad] bg-[#efe3d0] text-xs uppercase tracking-[0.18em] text-[var(--luxury-muted-strong)]">
                                                    <tr>
                                                        <th className="px-5 py-4 font-semibold">Picture</th>
                                                        <th className="px-5 py-4 font-semibold">Product Name</th>
                                                        <th className="px-5 py-4 font-semibold">SKU</th>
                                                        <th className="px-5 py-4 font-semibold">Price</th>
                                                        <th className="px-5 py-4 font-semibold">Stock Quantity</th>
                                                        <th className="px-5 py-4 font-semibold">Published</th>
                                                        <th className="px-5 py-4 font-semibold">Edit</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredProducts.map((product) => (
                                                        <tr
                                                            key={product.id}
                                                            className="border-b border-[#d8c8ad] last:border-b-0 hover:bg-[#fffaf2]"
                                                        >
                                                            <td className="px-5 py-4">
                                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[#efe3d0]">
                                                                    {primaryImage(product) && (
                                                                        <Image
                                                                            src={primaryImage(product)}
                                                                            alt={product.name}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <p className="font-semibold">{product.name}</p>
                                                                <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                                                    {product.brandName} / {product.gender} / {product.categoryName}
                                                                </p>
                                                            </td>
                                                            <td className="px-5 py-4 text-sm text-[var(--luxury-muted)]">
                                                                {product.variants[0]?.sku || "-"}
                                                            </td>
                                                            <td className="px-5 py-4">{currency(firstPrice(product))}</td>
                                                            <td className="px-5 py-4">{totalStock(product)}</td>
                                                            <td className="px-5 py-4">
                                                                <span className={product.isActive ? "text-[#516b2f]" : "text-[var(--luxury-muted)]"}>
                                                                    {product.isActive ? "Yes" : "No"}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <Link
                                                                    href={`/vendor/products/${product.id}`}
                                                                    className="inline-flex h-10 items-center justify-center rounded-full border border-[#d8c8ad] px-4 text-xs font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--luxury-gold)]"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                            </>
                                        )}
                                    </section>
                                </section>
                            )}

                            {activeTab === "orders" && (
                                <section className="space-y-5">
                                    {orders.length === 0 ? (
                                        <EmptyState
                                            icon={ClipboardList}
                                            title="No vendor orders yet"
                                            description="Orders will appear here once customers place them."
                                            actionLabel="Add Products"
                                            actionHref="/vendor/products/new"
                                        />
                                    ) : (
                                        orders.map((order) => (
                                            <article
                                                key={order.id}
                                                className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)]"
                                            >
                                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                                                            #{order.orderNumber}
                                                        </p>
                                                        <h3 className="mt-2 text-2xl font-normal [font-family:var(--font-serif)]">
                                                            {currency(order.finalAmount)}
                                                        </h3>
                                                    </div>
                                                    <span className={`rounded-full ${getStatusClasses(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_120px]">
                                                    <SelectField
                                                        label="Next Status"
                                                        value={orderStatusForms[order.id] || order.status}
                                                        onChange={(value) =>
                                                            setOrderStatusForms((forms) => ({
                                                                ...forms,
                                                                [order.id]: value,
                                                            }))
                                                        }
                                                        options={orderStatuses.map((status) => ({
                                                            value: status,
                                                            label: status,
                                                        }))}
                                                    />
                                                    <Link
                                                        href={`/orders/${order.id}`}
                                                        className="flex h-11 items-center justify-center rounded-full border border-[#d8c8ad] text-xs font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--luxury-gold)] md:self-end"
                                                    >
                                                        Details
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleOrderStatus(
                                                                order.id,
                                                                orderStatusForms[order.id] || order.status
                                                            )
                                                        }
                                                        className="h-11 rounded-full bg-[var(--luxury-ink)] text-xs font-semibold uppercase tracking-[0.12em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] md:self-end"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </section>
                            )}

                            {activeTab === "profile" && (
                                <ProfilePanel
                                    profileForm={profileForm}
                                    setProfileForm={setProfileForm}
                                    onSubmit={handleCreateVendor}
                                />
                            )}
                        </motion.div>
                    )}
                    </section>
                </div>
            </main>
        </ProtectedRoute>
    );
}

function MetricCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8ad] text-[var(--luxury-gold)]">
                {icon}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--luxury-muted)] sm:tracking-[0.28em]">
                {label}
            </p>
            <p className="mt-2 text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                {value}
            </p>
        </div>
    );
}

function StatusCount({ label, value }: { label: string; value: number }) {
    return (
        <div className="border border-[#d8c8ad] bg-[#fffaf2] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--luxury-muted)] sm:tracking-[0.18em]">
                {label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
    );
}

function ProfilePanel({
    profileForm,
    setProfileForm,
    onSubmit,
}: {
    profileForm: {
        businessName: string;
        gstNumber: string;
        address: string;
    };
    setProfileForm: React.Dispatch<
        React.SetStateAction<{
            businessName: string;
            gstNumber: string;
            address: string;
        }>
    >;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <section className="mx-auto max-w-3xl border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#d8c8ad] text-[var(--luxury-gold)]">
                <Store size={24} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] sm:tracking-[0.28em]">
                Vendor Profile
            </p>
            <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl">
                Business Details
            </h2>

            <form onSubmit={onSubmit} className="mt-7 grid gap-5">
                <Field
                    label="Business Name"
                    value={profileForm.businessName}
                    onChange={(value) =>
                        setProfileForm((form) => ({
                            ...form,
                            businessName: value,
                        }))
                    }
                    required
                />
                <Field
                    label="GST Number"
                    value={profileForm.gstNumber}
                    onChange={(value) =>
                        setProfileForm((form) => ({
                            ...form,
                            gstNumber: value,
                        }))
                    }
                />
                <TextArea
                    label="Address"
                    value={profileForm.address}
                    onChange={(value) =>
                        setProfileForm((form) => ({
                            ...form,
                            address: value,
                        }))
                    }
                />
                <button className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--luxury-ink)] px-6 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] sm:tracking-[0.16em]">
                    <PackagePlus size={17} />
                    Save Profile
                </button>
            </form>
        </section>
    );
}

function Field({
    label,
    value,
    onChange,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">
                {label}
            </span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[#fffaf2] px-3 outline-none transition focus:border-[var(--luxury-gold)]"
            />
        </label>
    );
}

function TextArea({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">
                {label}
            </span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none border border-[#d8c8ad] bg-[#fffaf2] px-3 py-3 outline-none transition focus:border-[var(--luxury-gold)]"
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}) {
    return (
        <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">
                {label}
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[#fffaf2] px-3 outline-none transition focus:border-[var(--luxury-gold)]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
