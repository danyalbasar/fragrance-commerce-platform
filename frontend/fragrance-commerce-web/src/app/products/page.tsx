"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { productService } from "@/services/productService";
import { getBrands } from "@/services/brandService";
import { getCategories } from "@/services/categoryService";
import type { Product, ProductGender } from "@/types/product";
import type { Brand } from "@/types/brand";
import type { Category } from "@/types/category";

export default function ProductsPage() {
    return (
        <Suspense fallback={<main className="min-h-screen bg-[var(--luxury-ivory)]" />}>
            <ProductsContent />
        </Suspense>
    );
}

function ProductsContent() {
    const searchParams = useSearchParams();

    const searchFromUrl = searchParams.get("search") || "";
    const genderFromUrl = searchParams.get("gender") as ProductGender | null;
    const categoryFromUrl = searchParams.get("category");

    const [search, setSearch] = useState("");
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
    const pageSize = 9;

    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedBrand = brands.find((b) => b.id === brandId);

    const fragranceCategories = ["Perfume", "Attar", "Customised Perfume"];
    const skincareCategories = ["Face Wash", "Fairness Cream", "Lens", "Nails"];

    const isFragrance =
        selectedCategory &&
        fragranceCategories.includes(selectedCategory.name);

    const isSkincare =
        selectedCategory &&
        skincareCategories.includes(selectedCategory.name);

    let heroTitle = "FRAGRANCE";
    let breadcrumbTitle = "Fragrance";
    let heroImage = "/banners/fragrance-men.jpg";

    if (isSkincare) {
        heroTitle = "SKINCARE";
        breadcrumbTitle = "Skincare";

        if (gender === "Women") {
            heroImage = "/banners/skincare-women.jpg";
        } else if (gender === "Unisex") {
            heroImage = "/banners/skincare-unisex.jpg";
        } else {
            heroImage = "/banners/skincare-men.jpg";
        }
    } else {
        heroTitle = "FRAGRANCE";
        breadcrumbTitle = "Fragrance";

        if (gender === "Women") {
            heroImage = "/banners/fragrance-women.jpg";
        } else if (gender === "Unisex") {
            heroImage = "/banners/fragrance-unisex.jpg";
        } else {
            heroImage = "/banners/fragrance-men.jpg";
        }
    }

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
                search: search || undefined,
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
        setSearch(searchFromUrl);
        setPageNumber(1);

        if (genderFromUrl) {
            setGender(genderFromUrl);
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
            }
        }

        if (!categoryFromUrl) {
            setCategoryId("");
        }
    }, [searchFromUrl, genderFromUrl, categoryFromUrl, categories]);

    useEffect(() => {
        loadProducts();
    }, [
        search,
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

    useEffect(() => {
        if (!showMobileFilters) return;

        const scrollY = window.scrollY;
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;
        const originalWidth = document.body.style.width;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.top = originalTop;
            document.body.style.width = originalWidth;
            window.scrollTo(0, scrollY);
        };
    }, [showMobileFilters]);

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

    const sortValue =
        sortBy === "price" && sortDirection === "asc"
            ? "price-asc"
            : sortBy === "price" && sortDirection === "desc"
                ? "price-desc"
                : sortBy === "name"
                    ? "name-asc"
                    : "newest";

    function renderSortSelect(className = "") {
        return (
            <select
                onChange={(e) => handleSort(e.target.value)}
                value={sortValue}
                className={`h-11 w-full border border-[#d8c8ad] bg-[var(--luxury-paper)] px-3 text-sm uppercase tracking-[0.08em] outline-none hover:border-[var(--luxury-gold)] ${className}`}
            >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
            </select>
        );
    }

    function renderFilterControls() {
        return (
            <>
                <div className="mb-5 flex items-center justify-between">
                    <span className="text-2xl font-normal [font-family:var(--font-serif)]">
                        Filter:
                    </span>

                    <button
                        onClick={resetFilters}
                        className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-gold)] hover:text-[var(--luxury-ink)]"
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
                            className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]"
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
                            className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]"
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
                            className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]"
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
                                            gender === item ? undefined : item
                                        );
                                        setPageNumber(1);
                                    }}
                                    className="h-4 w-4 accent-[var(--luxury-gold)]"
                                />

                                <span>{item}</span>
                            </label>
                        )
                    )}
                </FilterSection>

                <FilterSection title="Categories" count={categoryId ? 1 : 0}>
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
                                className="h-4 w-4 accent-[var(--luxury-gold)]"
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
                                        brandId === brand.id ? "" : brand.id
                                    );
                                    setPageNumber(1);
                                }}
                                className="h-4 w-4 accent-[var(--luxury-gold)]"
                            />

                            <span>{brand.name}</span>
                        </label>
                    ))}
                </FilterSection>

                <FilterSection title="Price">
                    <div className="mb-3 flex justify-between text-sm text-[var(--luxury-muted)]">
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
                        className="w-full accent-[var(--luxury-gold)]"
                    />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <input
                            value={minPrice}
                            onChange={(e) => {
                                setMinPrice(e.target.value);
                                setPageNumber(1);
                            }}
                            placeholder="Min"
                            className="border border-[#d8c8ad] bg-[#fffaf2] px-3 py-2 text-sm outline-none focus:border-[var(--luxury-gold)]"
                        />

                        <input
                            value={maxPrice}
                            onChange={(e) => {
                                setMaxPrice(e.target.value);
                                setPriceLimit(Number(e.target.value || 0));
                                setPageNumber(1);
                            }}
                            placeholder="Max"
                            className="border border-[#d8c8ad] bg-[#fffaf2] px-3 py-2 text-sm outline-none focus:border-[var(--luxury-gold)]"
                        />
                    </div>
                </FilterSection>

                <FilterSection title="Availability" count={inStockOnly ? 1 : 0}>
                    <label className="flex cursor-pointer items-center gap-3 py-2 text-sm">
                        <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => {
                                setInStockOnly(e.target.checked);
                                setPageNumber(1);
                            }}
                            className="h-4 w-4 accent-[var(--luxury-gold)]"
                        />

                        <span>Available Only</span>
                    </label>
                </FilterSection>
            </>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--luxury-ivory)] text-[var(--luxury-ink)]">
            <section className="relative h-[300px] overflow-hidden sm:h-[380px] md:h-[500px]">
                <img
                    src={heroImage}
                    alt={heroTitle}
                    className="h-full w-full object-cover object-top"
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,18,13,0.78),rgba(22,18,13,0.28),rgba(22,18,13,0.04))]" />

                <div className="absolute bottom-8 left-4 max-w-2xl pr-4 sm:left-6 md:bottom-10 md:left-16">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--luxury-gold)] sm:tracking-[0.38em]">
                        Curated Collection
                    </p>
                    <h1 className="text-4xl font-normal tracking-normal text-white [font-family:var(--font-serif)] sm:text-5xl md:text-7xl">
                        {heroTitle}
                    </h1>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/76 md:text-base">
                        Refined selections for signature rituals, daily polish, and memorable evenings.
                    </p>
                </div>
            </section>

            <section className="px-4 py-8 sm:px-6 md:py-10">
                <div className="mx-auto max-w-[1800px]">
                    <div className="mb-8 flex flex-col gap-5 border-b border-[#d8c8ad] pb-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--luxury-muted)] sm:text-sm sm:tracking-[0.18em]">
                                <Link href="/" className="hover:text-[var(--luxury-ink)]">
                                    Home
                                </Link> {" "}
                                /{" "}
                                <span className="text-[var(--luxury-ink)]">{breadcrumbTitle}</span>
                            </p>

                            <p className="mt-8 hidden text-sm uppercase tracking-[0.24em] text-[var(--luxury-gold)] md:block">
                                {totalCount} Products
                            </p>
                        </div>

                        <div className="hidden flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 md:flex">
                            <span className="text-sm uppercase tracking-[0.14em] text-[var(--luxury-muted)] sm:tracking-[0.18em]">
                                Sort By:
                            </span>

                            {renderSortSelect("sm:min-w-44")}
                        </div>
                    </div>

                    <div className="mb-6 flex items-center justify-between border-b border-[#d8c8ad] pb-5 md:hidden">
                        <button
                            type="button"
                            onClick={() => setShowMobileFilters(true)}
                            className="flex items-center gap-3 text-sm font-semibold tracking-[0.12em] text-[var(--luxury-ink)]"
                        >
                            <SlidersHorizontal size={18} />
                            Filter and sort
                        </button>

                        <span className="text-sm uppercase tracking-[0.18em] text-[var(--luxury-gold)]">
                            {totalCount} products
                        </span>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
                        <aside className="hidden h-fit border border-[#d8c8ad] bg-[var(--luxury-paper)] p-4 shadow-[0_18px_45px_rgba(22,18,13,0.06)] sm:p-5 lg:sticky lg:top-24 lg:block">
                            <div className="mb-5 flex items-center justify-between">
                                <span className="text-2xl font-normal [font-family:var(--font-serif)]">
                                    Filter:
                                </span>

                                <button
                                    onClick={resetFilters}
                                    className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-gold)] hover:text-[var(--luxury-ink)]"
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
                                        className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]"
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
                                        className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]"
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
                                        className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]"
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
                                                className="h-4 w-4 accent-[var(--luxury-gold)]"
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
                                            className="h-4 w-4 accent-[var(--luxury-gold)]"
                                        />

                                        <span>
                                            {category.name === "Face Wash" ||
                                                category.name === "Fairness Cream" ||
                                                category.name === "Lens" ||
                                                category.name === "Nails"
                                                ? category.name
                                                : category.name}
                                        </span>
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
                                            className="h-4 w-4 accent-[var(--luxury-gold)]"
                                        />

                                        <span>{brand.name}</span>
                                    </label>
                                ))}
                            </FilterSection>

                            <FilterSection title="Price">
                                <div className="mb-3 flex justify-between text-sm text-[var(--luxury-muted)]">
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
                                    className="w-full accent-[var(--luxury-gold)]"
                                />

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <input
                                        value={minPrice}
                                        onChange={(e) => {
                                            setMinPrice(e.target.value);
                                            setPageNumber(1);
                                        }}
                                        placeholder="Min"
                                        className="border border-[#d8c8ad] bg-[#fffaf2] px-3 py-2 text-sm outline-none focus:border-[var(--luxury-gold)]"
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
                                        className="border border-[#d8c8ad] bg-[#fffaf2] px-3 py-2 text-sm outline-none focus:border-[var(--luxury-gold)]"
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
                                        className="h-4 w-4 accent-[var(--luxury-gold)]"
                                    />

                                    <span>Available Only</span>
                                </label>
                            </FilterSection>
                        </aside>

                        <section>
                            {loading ? (
                                <p className="text-sm uppercase tracking-[0.24em] text-[var(--luxury-muted)]">Loading products...</p>
                            ) : products.length === 0 ? (
                                <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-10 text-center">
                                    <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                        No products found
                                    </h2>

                                    <p className="mt-2 text-[var(--luxury-muted)]">
                                        Try changing your filters.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        {products.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                            />
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="mt-10 flex flex-wrap justify-center gap-2">
                                            <button
                                                disabled={pageNumber === 1}
                                                onClick={() =>
                                                    setPageNumber((p) => p - 1)
                                                }
                                                className="h-10 w-10 border border-[#d8c8ad] bg-[var(--luxury-paper)] disabled:opacity-40"
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
                                                            ? "h-10 w-10 bg-[var(--luxury-ink)] text-[var(--luxury-paper)]"
                                                            : "h-10 w-10 border border-[#d8c8ad] bg-[var(--luxury-paper)]"
                                                    }
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                disabled={
                                                    pageNumber === totalPages
                                                }
                                                onClick={() =>
                                                    setPageNumber((p) => p + 1)
                                                }
                                                className="h-10 w-10 border border-[#d8c8ad] bg-[var(--luxury-paper)] disabled:opacity-40"
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
            </section>

            {showMobileFilters && (
                <div className="fixed inset-0 z-[80] overscroll-none md:hidden">
                    <button
                        type="button"
                        aria-label="Close filter overlay"
                        onClick={() => setShowMobileFilters(false)}
                        className="absolute inset-0 bg-black/45"
                    />

                    <aside className="absolute right-0 top-0 flex h-full w-[82vw] max-w-[390px] flex-col bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-[0_24px_70px_rgba(22,18,13,0.24)]">
                        <div className="flex items-start justify-between border-b border-[#d8c8ad] px-6 py-5">
                            <div>
                                <h2 className="text-base font-semibold tracking-[0.08em]">
                                    Filter and sort
                                </h2>
                                <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                    {totalCount} products
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowMobileFilters(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#efe3d0]"
                                aria-label="Close filters"
                            >
                                <X size={28} strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
                            <div className="mb-6">
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-[var(--luxury-muted)]">
                                    Sort by:
                                </label>
                                {renderSortSelect()}
                            </div>

                            {renderFilterControls()}
                        </div>

                        <div className="border-t border-[#d8c8ad] px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowMobileFilters(false)}
                                className="h-12 w-full rounded-full bg-[var(--luxury-ink)] text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)]"
                            >
                                View products
                            </button>
                        </div>
                    </aside>
                </div>
            )}
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
        <div className="border-t border-[#d8c8ad] py-5">
            <button
                onClick={() => setOpen((value) => !value)}
                className="flex w-full cursor-pointer items-center justify-between text-left"
            >
                <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    {title}
                    {count ? ` (${count})` : ""}
                </span>

                <span className="text-lg">{open ? "−" : "+"}</span>
            </button>

            {open && <div className="mt-4">{children}</div>}
        </div>
    );
}
