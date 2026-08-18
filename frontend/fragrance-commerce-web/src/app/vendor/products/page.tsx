"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Boxes, PackagePlus, Search, SlidersHorizontal, X } from "lucide-react";
import { productService } from "@/services/productService";
import { EmptyState } from "@/components/common/EmptyState";
import type { Product } from "@/types/product";
import { readCache, writeCache } from "@/utils/swrCache";

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

export default function VendorProductsPage() {
    const [products, setProducts] = useState<Product[]>(() =>
        readCache<Product[]>("vendor-products") ?? []
    );
    const [loading, setLoading] = useState(
        () => readCache<Product[]>("vendor-products") === null
    );
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        name: "",
        sku: "",
        category: "",
        gender: "",
        status: "",
        stock: "",
    });

    const categories = useMemo(
        () =>
            Array.from(new Set(products.map((p) => p.categoryName)))
                .filter(Boolean)
                .sort(),
        [products]
    );

    const filtered = useMemo(() => {
        return products.filter((product) => {
            const stock = totalStock(product);
            if (filters.name) {
                const q = filters.name.toLowerCase();
                if (
                    !product.name.toLowerCase().includes(q) &&
                    !product.brandName?.toLowerCase().includes(q)
                )
                    return false;
            }
            if (filters.sku) {
                const q = filters.sku.toLowerCase();
                if (!product.variants.some((v) => v.sku.toLowerCase().includes(q)))
                    return false;
            }
            if (filters.category && product.categoryName !== filters.category) return false;
            if (filters.gender && product.gender !== filters.gender) return false;
            if (filters.status) {
                if (filters.status === "Active" && !product.isActive) return false;
                if (filters.status === "Inactive" && product.isActive) return false;
            }
            if (filters.stock === "Low" && (stock === 0 || stock > 5)) return false;
            if (filters.stock === "Out" && stock !== 0) return false;
            return true;
        });
    }, [products, filters]);

    const hasActiveFilters = Object.values(filters).some(Boolean);
    const lowStockCount = useMemo(
        () =>
            products.filter((p) =>
                p.variants.some((v) => v.stockQuantity > 0 && v.stockQuantity <= 5)
            ).length,
        [products]
    );

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                setLoading(true);
                const data = await productService.getVendorProducts();
                if (!active) return;
                setProducts(data);
                writeCache("vendor-products", data);
            } catch {
                // handled by layout
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">Products</p>
                    <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                        Product List
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {filtered.length} of {products.length} products
                        {lowStockCount > 0 && (
                            <span className="ml-2 text-amber-600">· {lowStockCount} low stock</span>
                        )}
                    </p>
                </div>
                <Link
                    href="/vendor/products/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                    <PackagePlus size={16} />
                    Add Product
                </Link>
            </div>

            {/* Filters bar */}
            <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        type="button"
                        onClick={() => setShowFilters((v) => !v)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                        {hasActiveFilters && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1.5 text-[10px] font-bold text-white">
                                {Object.values(filters).filter(Boolean).length}
                            </span>
                        )}
                    </button>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() =>
                                setFilters({ name: "", sku: "", category: "", gender: "", status: "", stock: "" })
                            }
                            className="text-sm text-gray-500 hover:text-gray-900"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="grid gap-4 border-t border-gray-100 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
                        <FilterInput
                            label="Product Name"
                            value={filters.name}
                            onChange={(v) => setFilters((f) => ({ ...f, name: v }))}
                        />
                        <FilterInput
                            label="Variant SKU"
                            value={filters.sku}
                            onChange={(v) => setFilters((f) => ({ ...f, sku: v }))}
                        />
                        <FilterSelect
                            label="Category"
                            value={filters.category}
                            onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
                            options={[
                                { value: "", label: "All categories" },
                                ...categories.map((c) => ({ value: c, label: c })),
                            ]}
                        />
                        <FilterSelect
                            label="Gender"
                            value={filters.gender}
                            onChange={(v) => setFilters((f) => ({ ...f, gender: v }))}
                            options={[
                                { value: "", label: "All genders" },
                                { value: "Men", label: "Men" },
                                { value: "Women", label: "Women" },
                                { value: "Unisex", label: "Unisex" },
                            ]}
                        />
                        <FilterSelect
                            label="Published"
                            value={filters.status}
                            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                            options={[
                                { value: "", label: "All" },
                                { value: "Active", label: "Active" },
                                { value: "Inactive", label: "Inactive" },
                            ]}
                        />
                        <FilterSelect
                            label="Stock"
                            value={filters.stock}
                            onChange={(v) => setFilters((f) => ({ ...f, stock: v }))}
                            options={[
                                { value: "", label: "All" },
                                { value: "Low", label: "Low Stock" },
                                { value: "Out", label: "Out of Stock" },
                            ]}
                        />
                    </div>
                )}
            </div>

            {/* Product table */}
            <div className="rounded-xl border border-gray-200 bg-white">
                {loading && products.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">Loading products...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-10">
                        <EmptyState
                            icon={Boxes}
                            title="No products found"
                            description={
                                hasActiveFilters
                                    ? "Try adjusting your search filters."
                                    : "Add your first product to get started."
                            }
                            actionLabel={hasActiveFilters ? undefined : "Add Product"}
                            actionHref={hasActiveFilters ? undefined : "/vendor/products/new"}
                            compact
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-gray-500">
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3">SKU</th>
                                        <th className="px-5 py-3">Price</th>
                                        <th className="px-5 py-3">Stock</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((product) => (
                                        <tr key={product.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {product.brandName} · {product.gender}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-500">
                                                {product.variants[0]?.sku || "-"}
                                            </td>
                                            <td className="px-5 py-3 font-medium text-gray-900">
                                                {currency(product.variants[0]?.sellingPrice || 0)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={
                                                    totalStock(product) === 0
                                                        ? "text-red-500 font-medium"
                                                        : totalStock(product) <= 5
                                                        ? "text-amber-600 font-medium"
                                                        : "text-gray-700"
                                                }>
                                                    {totalStock(product)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    product.isActive
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}>
                                                    {product.isActive ? "Active" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Link
                                                    href={`/vendor/products/${product.id}`}
                                                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="grid gap-3 p-4 md:hidden">
                            {filtered.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/vendor/products/${product.id}`}
                                    className="flex gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                                >
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {primaryImage(product) && (
                                            <Image
                                                src={primaryImage(product)}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {product.brandName} · {currency(product.variants[0]?.sellingPrice || 0)}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                product.isActive
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}>
                                                {product.isActive ? "Active" : "Draft"}
                                            </span>
                                            <span className={`text-xs font-medium ${
                                                totalStock(product) <= 5 ? "text-amber-600" : "text-gray-500"
                                            }`}>
                                                Stock: {totalStock(product)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function FilterInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <label className="block">
            <span className="text-xs font-medium text-gray-500">{label}</span>
            <div className="relative mt-1">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-sm outline-none transition focus:border-gray-400"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </label>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Array<{ value: string; label: string }>;
}) {
    return (
        <label className="block">
            <span className="text-xs font-medium text-gray-500">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-400"
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
