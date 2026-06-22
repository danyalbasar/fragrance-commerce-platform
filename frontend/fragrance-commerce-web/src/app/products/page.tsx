"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import { productService } from "@/services/productService";
import { getBrands } from "@/services/brandService";
import { getCategories } from "@/services/categoryService";
import type { Product, ProductGender } from "@/types/product";
import type { Brand } from "@/types/brand";
import type { Category } from "@/types/category";

export default function ProductsPage() {
    const searchParams = useSearchParams();

    const genderFromUrl =
        searchParams.get("gender") as ProductGender | null;

    const categoryFromUrl = searchParams.get("category");

    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [gender, setGender] = useState<ProductGender | undefined>();
    const [brandId, setBrandId] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [priceLimit, setPriceLimit] = useState(20000);
    const [inStockOnly, setInStockOnly] = useState(false);

    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");

    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 6;

    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedBrand = brands.find((b) => b.id === brandId);

    async function loadMasterData() {
        const [brandData, categoryData] = await Promise.all([
            getBrands(),
            getCategories(),
        ]);

        setBrands(brandData);
        setCategories(categoryData);
    }

    async function loadProducts() {
        try {
            setLoading(true);

            const result = await productService.search({
                gender,
                brandId: brandId || undefined,
                categoryId: categoryId || undefined,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                inStockOnly: inStockOnly || undefined,
                sortBy,
                sortDirection,
                pageNumber,
                pageSize,
            });

            setProducts(result.items);
            setTotalCount(result.totalCount);
            setTotalPages(result.totalPages);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMasterData();
    }, []);

    useEffect(() => {
        if (genderFromUrl) {
            setGender(genderFromUrl);
            setPageNumber(1);
        } else {
            setGender(undefined);
        }

        if (categoryFromUrl && categories.length > 0) {
            const matchedCategory = categories.find(
                (category) =>
                    category.name.toLowerCase() ===
                    categoryFromUrl.toLowerCase()
            );

            if (matchedCategory) {
                setCategoryId(matchedCategory.id);
                setPageNumber(1);
            }
        }

        if (!categoryFromUrl) {
            setCategoryId("");
        }
    }, [genderFromUrl, categoryFromUrl, categories]);

    useEffect(() => {
        loadProducts();
    }, [
        gender,
        brandId,
        categoryId,
        minPrice,
        maxPrice,
        inStockOnly,
        sortBy,
        sortDirection,
        pageNumber,
    ]);

    function resetFilters() {
        setGender(undefined);
        setBrandId("");
        setCategoryId("");
        setMinPrice("");
        setMaxPrice("");
        setPriceLimit(20000);
        setInStockOnly(false);
        setPageNumber(1);
    }

    function handleSort(value: string) {
        setPageNumber(1);

        if (value === "newest") {
            setSortBy("createdAt");
            setSortDirection("desc");
        }

        if (value === "price-asc") {
            setSortBy("price");
            setSortDirection("asc");
        }

        if (value === "price-desc") {
            setSortBy("price");
            setSortDirection("desc");
        }

        if (value === "name-asc") {
            setSortBy("name");
            setSortDirection("asc");
        }
    }

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="mb-2 text-sm text-gray-500">
                            Home / Products
                        </p>

                        <h1 className="text-4xl font-bold">Products</h1>

                        <p className="mt-2 text-gray-500">
                            {totalCount} fragrances
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Sort</span>

                        <select
                            onChange={(e) => handleSort(e.target.value)}
                            defaultValue="newest"
                            className="h-10 rounded-lg border bg-white px-3 text-sm outline-none hover:border-black"
                        >
                            <option value="newest">Newest</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    <aside className="h-fit bg-white p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <span className="text-lg font-medium">Filter:</span>

                            <button
                                onClick={resetFilters}
                                className="text-sm underline hover:text-gray-500"
                            >
                                Remove all
                            </button>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-2">
                            {gender && (
                                <button
                                    onClick={() => {
                                        setGender(undefined);
                                        setPageNumber(1);
                                    }}
                                    className="rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-widest"
                                >
                                    Gender: {gender} ×
                                </button>
                            )}

                            {selectedCategory && (
                                <button
                                    onClick={() => {
                                        setCategoryId("");
                                        setPageNumber(1);
                                    }}
                                    className="rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-widest"
                                >
                                    Category: {selectedCategory.name} ×
                                </button>
                            )}

                            {selectedBrand && (
                                <button
                                    onClick={() => {
                                        setBrandId("");
                                        setPageNumber(1);
                                    }}
                                    className="rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-widest"
                                >
                                    Brand: {selectedBrand.name} ×
                                </button>
                            )}
                        </div>

                        <FilterSection title="Gender" count={gender ? 1 : 0}>
                            {(["Men", "Women", "Unisex"] as ProductGender[]).map(
                                (item) => (
                                    <label
                                        key={item}
                                        className="flex cursor-pointer items-center gap-3 py-2 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={gender === item}
                                            onChange={() => {
                                                setGender(
                                                    gender === item
                                                        ? undefined
                                                        : item
                                                );
                                                setPageNumber(1);
                                            }}
                                            className="h-5 w-5 accent-black"
                                        />

                                        <span>{item}</span>
                                    </label>
                                )
                            )}
                        </FilterSection>

                        <FilterSection
                            title="Categories"
                            count={categoryId ? 1 : 0}
                        >
                            {categories.map((category) => (
                                <label
                                    key={category.id}
                                    className="flex cursor-pointer items-center gap-3 py-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={categoryId === category.id}
                                        onChange={() => {
                                            setCategoryId(
                                                categoryId === category.id
                                                    ? ""
                                                    : category.id
                                            );
                                            setPageNumber(1);
                                        }}
                                        className="h-5 w-5 accent-black"
                                    />

                                    <span>{category.name}</span>
                                </label>
                            ))}
                        </FilterSection>

                        <FilterSection title="Brands" count={brandId ? 1 : 0}>
                            {brands.map((brand) => (
                                <label
                                    key={brand.id}
                                    className="flex cursor-pointer items-center gap-3 py-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={brandId === brand.id}
                                        onChange={() => {
                                            setBrandId(
                                                brandId === brand.id
                                                    ? ""
                                                    : brand.id
                                            );
                                            setPageNumber(1);
                                        }}
                                        className="h-5 w-5 accent-black"
                                    />

                                    <span>{brand.name}</span>
                                </label>
                            ))}
                        </FilterSection>

                        <FilterSection title="Price">
                            <div className="mb-3 flex justify-between text-sm text-gray-500">
                                <span>₹0</span>
                                <span>₹{priceLimit}</span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="20000"
                                step="500"
                                value={priceLimit}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPriceLimit(Number(value));
                                    setMinPrice("0");
                                    setMaxPrice(value);
                                    setPageNumber(1);
                                }}
                                className="w-full accent-black"
                            />

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <input
                                    value={minPrice}
                                    onChange={(e) => {
                                        setMinPrice(e.target.value);
                                        setPageNumber(1);
                                    }}
                                    placeholder="Min"
                                    className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
                                />

                                <input
                                    value={maxPrice}
                                    onChange={(e) => {
                                        setMaxPrice(e.target.value);
                                        setPriceLimit(
                                            Number(e.target.value || 0)
                                        );
                                        setPageNumber(1);
                                    }}
                                    placeholder="Max"
                                    className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
                                />
                            </div>
                        </FilterSection>

                        <FilterSection
                            title="Availability"
                            count={inStockOnly ? 1 : 0}
                        >
                            <label className="flex cursor-pointer items-center gap-3 py-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => {
                                        setInStockOnly(e.target.checked);
                                        setPageNumber(1);
                                    }}
                                    className="h-5 w-5 accent-black"
                                />

                                <span>In Stock Only</span>
                            </label>
                        </FilterSection>
                    </aside>

                    <section>
                        {loading ? (
                            <p>Loading products...</p>
                        ) : products.length === 0 ? (
                            <div className="rounded-2xl border bg-white p-10 text-center">
                                <h2 className="text-xl font-semibold">
                                    No products found
                                </h2>

                                <p className="mt-2 text-gray-500">
                                    Try changing your filters.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-10 flex justify-center gap-2">
                                        <button
                                            disabled={pageNumber === 1}
                                            onClick={() =>
                                                setPageNumber((p) => p - 1)
                                            }
                                            className="h-10 w-10 rounded-lg border bg-white disabled:opacity-40"
                                        >
                                            ‹
                                        </button>

                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => index + 1
                                        ).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    setPageNumber(page)
                                                }
                                                className={
                                                    pageNumber === page
                                                        ? "h-10 w-10 rounded-lg bg-black text-white"
                                                        : "h-10 w-10 rounded-lg border bg-white"
                                                }
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            disabled={pageNumber === totalPages}
                                            onClick={() =>
                                                setPageNumber((p) => p + 1)
                                            }
                                            className="h-10 w-10 rounded-lg border bg-white disabled:opacity-40"
                                        >
                                            ›
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

function FilterSection({
    title,
    count,
    children,
}: {
    title: string;
    count?: number;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(true);

    return (
        <div className="border-t py-5">
            <button
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between text-left"
            >
                <span className="text-sm font-medium">
                    {title}
                    {count ? ` (${count})` : ""}
                </span>

                <span className="text-lg">{open ? "⌃" : "⌄"}</span>
            </button>

            {open && <div className="mt-4">{children}</div>}
        </div>
    );
}