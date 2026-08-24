"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, SearchX } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import QuickAddBar from "@/components/products/QuickAddBar";
import { EmptyState } from "@/components/common/EmptyState";
import { JsonLd } from "@/components/seo/JsonLd";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import { productService } from "@/services/productService";
import { getBrands } from "@/services/brandService";
import { getCategories } from "@/services/categoryService";
import { getPublicSettings } from "@/services/siteSettingsService";
import { siteConfig } from "@/config/site";
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
    const [genders, setGenders] = useState<ProductGender[]>(["Men", "Women", "Unisex"]);

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
    const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

    const mobileFiltersRef = useRef<HTMLElement>(null);
    useFocusTrap(mobileFiltersRef, showMobileFilters, () => setShowMobileFilters(false));
    useScrollLock(showMobileFilters);

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedBrand = brands.find((b) => b.id === brandId);

    const skincareCategories = ["Face Wash", "Fairness Cream", "Lens", "Nails"];

    const isSkincare =
        selectedCategory &&
        skincareCategories.includes(selectedCategory.name);

    let heroTitle = "FRAGRANCE";
    let breadcrumbTitle = "Fragrance";
    let heroImage = "/banners/fragrance-men.jpg";

    if (isSkincare) {
        heroTitle = "SKINCARE";
        breadcrumbTitle = "Skincare";
    }

    if (isSkincare && gender === "Women") {
        heroImage = "/banners/skincare-women.jpg";
    } else if (isSkincare && gender === "Unisex") {
        heroImage = "/banners/skincare-unisex.jpg";
    } else if (isSkincare) {
        heroImage = "/banners/skincare-men.jpg";
    } else if (gender === "Women") {
        heroImage = "/banners/fragrance-women.jpg";
    } else if (gender === "Unisex") {
        heroImage = "/banners/fragrance-unisex.jpg";
    } else {
        heroImage = "/banners/fragrance-men.jpg";
    }

    async function loadMasterData() {
        const [brandData, categoryData, siteSettings] = await Promise.all([
            getBrands(),
            getCategories(),
            getPublicSettings().catch(() => ({} as Record<string, string>)),
        ]);

        setBrands(brandData);
        setCategories(categoryData);

        try {
            const parsedGenders = JSON.parse(siteSettings.available_genders || "[]");
            if (Array.isArray(parsedGenders) && parsedGenders.length > 0) {
                setGenders(parsedGenders as ProductGender[]);
            }
        } catch { /* keep defaults */ }
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
        const timer = window.setTimeout(loadMasterData, 0);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
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
        }, 0);

        return () => window.clearTimeout(timer);
    }, [searchFromUrl, genderFromUrl, categoryFromUrl, categories]);

    useEffect(() => {
        const timer = window.setTimeout(
            loadProducts,
            minPrice !== "" || maxPrice !== "" ? 350 : 0
        );

        return () => window.clearTimeout(timer);
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

    function resetFilters() {
        setSearch("");
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
                aria-label="Sort products"
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
                        className="-my-2.5 py-2.5 cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)]"
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
                            className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
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
                            className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
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
                            className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
                        >
                            Brand: {selectedBrand.name} ×
                        </button>
                    )}
                </div>

                <FilterSection title="Gender" count={gender ? 1 : 0}>
                    {genders.map(
                        (item) => (
                            <label
                                key={item}
                                className="flex cursor-pointer items-center gap-3 py-2.5 text-sm"
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
                            className="flex cursor-pointer items-center gap-3 py-2.5 text-sm"
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
                            className="flex cursor-pointer items-center gap-3 py-2.5 text-sm"
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
                        aria-label={`Maximum price: ₹${priceLimit}`}
                        className="h-10 w-full cursor-pointer accent-[var(--luxury-gold)]"
                    />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <input
                            value={minPrice}
                            onChange={(e) => {
                                setMinPrice(e.target.value);
                                setPageNumber(1);
                            }}
                            placeholder="Min"
                            aria-label="Minimum price"
                            inputMode="numeric"
                            className="border border-[#d8c8ad] bg-[#fffaf2] px-3 py-2.5 text-sm outline-none focus:border-[var(--luxury-gold)]"
                        />

                        <input
                            value={maxPrice}
                            onChange={(e) => {
                                setMaxPrice(e.target.value);
                                setPriceLimit(Number(e.target.value || 0));
                                setPageNumber(1);
                            }}
                            placeholder="Max"
                            aria-label="Maximum price"
                            inputMode="numeric"
                            className="border border-[#d8c8ad] bg-[#fffaf2] px-3 py-2.5 text-sm outline-none focus:border-[var(--luxury-gold)]"
                        />
                    </div>
                </FilterSection>

                <FilterSection title="Availability" count={inStockOnly ? 1 : 0}>
                    <label className="flex cursor-pointer items-center gap-3 py-2.5 text-sm">
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
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: [
                        {
                            "@type": "ListItem",
                            position: 1,
                            name: "Home",
                            item: `${siteConfig.url}/`,
                        },
                        {
                            "@type": "ListItem",
                            position: 2,
                            name: breadcrumbTitle,
                            item: `${siteConfig.url}/products`,
                        },
                    ],
                }}
            />
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    name: `${breadcrumbTitle} Collection`,
                    url: `${siteConfig.url}/products`,
                    description:
                        "Curated luxury perfumes, attars, custom blends and skincare at Fragrance Commerce.",
                    hasPart: {
                        "@type": "ItemList",
                        itemListElement:
                            products.length > 0
                                ? products.map((product, index) => ({
                                      "@type": "ListItem",
                                      position: index + 1,
                                      url: `${siteConfig.url}/products/${product.id}`,
                                      name: product.name,
                                  }))
                                : undefined,
                    },
                }}
            />

            <section className="relative h-[300px] overflow-hidden sm:h-[380px] md:h-[500px]">
                <Image
                    src={heroImage}
                    alt={heroTitle}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-top"
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
                                <Link href="/" className="-my-3 py-3 hover:text-[var(--luxury-ink)]">
                                    Home
                                </Link> {" "}
                                /{" "}
                                <span className="text-[var(--luxury-ink)]">{breadcrumbTitle}</span>
                            </p>

                            <p className="mt-8 hidden text-sm uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)] md:block">
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
                            aria-haspopup="dialog"
                            aria-expanded={showMobileFilters}
                            className="-my-2.5 py-2.5 flex items-center gap-3 text-sm font-semibold tracking-[0.12em] text-[var(--luxury-ink)] transition-colors duration-200 hover:text-[var(--luxury-gold)]"
                        >
                            <SlidersHorizontal size={18} />
                            Filter and sort
                        </button>

                        <span className="text-sm uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">
                            {totalCount} products
                        </span>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
                        <aside className="hidden h-fit rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-4 shadow-[var(--luxury-shadow-sm)] sm:p-5 lg:sticky lg:top-24 lg:block">
                            <div className="mb-5 flex items-center justify-between">
                                <span className="text-2xl font-normal [font-family:var(--font-serif)]">
                                    Filter:
                                </span>

                                <button
                                    onClick={resetFilters}
                                    className="-my-2.5 py-2.5 cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)]"
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
                                        className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
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
                                        className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
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
                                        className="cursor-pointer rounded-full border border-[#d8c8ad] bg-[#f1e6d4] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
                                    >
                                        Brand: {selectedBrand.name} ×
                                    </button>
                                )}
                            </div>

                            <FilterSection title="Gender" count={gender ? 1 : 0}>
                                {genders.map(
                                    (item) => (
                                        <label
                                            key={item}
                                            className="flex cursor-pointer items-center gap-3 py-2.5 text-sm"
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
                                        className="flex cursor-pointer items-center gap-3 py-2.5 text-sm"
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
                                        className="flex cursor-pointer items-center gap-3 py-2.5 text-sm"
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
                                    aria-label={`Maximum price: ₹${priceLimit}`}
                                    className="h-10 w-full cursor-pointer accent-[var(--luxury-gold)]"
                                />

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <input
                                        value={minPrice}
                                        onChange={(e) => {
                                            setMinPrice(e.target.value);
                                            setPageNumber(1);
                                        }}
                                        placeholder="Min"
                                        aria-label="Minimum price"
                                        inputMode="numeric"
                                        className="border border-[#d8c8ad] bg-[#fffaf2] px-3 py-2.5 text-sm outline-none focus:border-[var(--luxury-gold)]"
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
                                        aria-label="Maximum price"
                                        inputMode="numeric"
                                        className="border border-[#d8c8ad] bg-[#fffaf2] px-3 py-2.5 text-sm outline-none focus:border-[var(--luxury-gold)]"
                                    />
                                </div>
                            </FilterSection>

                            <FilterSection
                                title="Availability"
                                count={inStockOnly ? 1 : 0}
                            >
                                <label className="flex cursor-pointer items-center gap-3 py-2.5 text-sm">
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
                            <h2 className="sr-only">Products</h2>

                            {loading ? (
                                <div className="grid grid-cols-2 gap-3 gap-y-6 sm:gap-6 xl:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex h-full flex-col overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)]"
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-[var(--luxury-sand)]">
                                                <div className="h-full w-full animate-pulse bg-gray-200" />
                                            </div>

                                            <div className="flex flex-1 flex-col p-4 sm:p-5">
                                                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />

                                                <div className="mt-2 h-6 w-40 animate-pulse rounded bg-gray-200" />

                                                <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200" />

                                                <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-200" />

                                                <div className="mt-auto pt-5">
                                                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                    <EmptyState
                                        icon={SearchX}
                                        title="No products found"
                                        description="Try adjusting your filters or search terms to discover more of the collection."
                                        actionLabel="Clear Filters"
                                        onAction={resetFilters}
                                    />
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-3 gap-y-6 sm:gap-6 xl:grid-cols-3">
                                        {products.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                compactMobile
                                                onQuickAdd={setQuickAddProduct}
                                            />
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <nav
                                            aria-label="Pagination"
                                            className="mt-10 flex flex-wrap justify-center gap-2"
                                        >
                                            <button
                                                disabled={pageNumber === 1}
                                                onClick={() =>
                                                    setPageNumber((p) => p - 1)
                                                }
                                                aria-label="Previous page"
                                                className="h-10 w-10 border border-[#d8c8ad] bg-[var(--luxury-paper)] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] disabled:opacity-40"
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
                                                    aria-label={`Go to page ${page}`}
                                                    aria-current={
                                                        pageNumber === page
                                                            ? "page"
                                                            : undefined
                                                    }
                                                    className={
                                                        pageNumber === page
                                                            ? "h-10 w-10 bg-[var(--luxury-ink)] text-[var(--luxury-paper)]"
                                                            : "h-10 w-10 border border-[#d8c8ad] bg-[var(--luxury-paper)] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
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
                                                aria-label="Next page"
                                                className="h-10 w-10 border border-[#d8c8ad] bg-[var(--luxury-paper)] transition-colors duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] disabled:opacity-40"
                                            >
                                                ›
                                            </button>
                                        </nav>
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

                    <aside
                        ref={mobileFiltersRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Filter and sort"
                        className="absolute right-0 top-0 flex h-full w-[82vw] max-w-[390px] flex-col border-l border-[var(--luxury-line)] bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-[var(--luxury-shadow-lg)]"
                    >
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
                                className="h-12 w-full rounded-full bg-[var(--luxury-ink)] text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition hover:bg-[var(--luxury-moss)]"
                            >
                                View products
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            <QuickAddBar
                product={quickAddProduct}
                onClose={() => setQuickAddProduct(null)}
            />
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
    const contentId = useId();

    return (
        <div className="border-t border-[#d8c8ad] py-5">
            <button
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls={contentId}
                className="-my-2.5 py-2.5 flex w-full cursor-pointer items-center justify-between text-left transition-colors duration-200 hover:text-[var(--luxury-gold)]"
            >
                <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    {title}
                    {count ? ` (${count})` : ""}
                </span>

                <span className="text-lg" aria-hidden="true">
                    {open ? "−" : "+"}
                </span>
            </button>

            {open && (
                <div id={contentId} role="group" aria-label={title} className="mt-4">
                    {children}
                </div>
            )}
        </div>
    );
}
