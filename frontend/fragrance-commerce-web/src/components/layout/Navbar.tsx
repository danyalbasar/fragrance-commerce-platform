"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Menu, Minus, Plus, Search, ShoppingBag, Trash2, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCart, removeCartItem, updateCartItem } from "@/services/cartService";
import { getWishlist } from "@/services/wishlistService";
import type { Cart } from "@/types/cart";

export default function Navbar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { isLoggedIn, logoutUser, initials, roles } = useAuth();

    const [showSearch, setShowSearch] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [openMobileGender, setOpenMobileGender] = useState<Record<string, boolean>>({
        Men: false,
        Women: false,
        Unisex: false,
    });
    const [openMobileGroups, setOpenMobileGroups] = useState<Record<string, boolean>>({});
    const [search, setSearch] = useState("");
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cart, setCart] = useState<Cart | null>(null);
    const [showCartPreview, setShowCartPreview] = useState(false);
    const [cartPreviewLoading, setCartPreviewLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const searchPanelRef = useRef<HTMLDivElement>(null);
    const searchButtonRef = useRef<HTMLButtonElement>(null);
    const cartPreviewRef = useRef<HTMLElement>(null);
    const cartButtonRef = useRef<HTMLButtonElement>(null);

    const activeGender = searchParams.get("gender");
    const canUseVendorStudio =
        roles.includes("Vendor") ||
        roles.includes("Admin") ||
        roles.includes("SuperAdmin");
    const isVendorAccount = roles.includes("Vendor");
    const homeHref = isVendorAccount ? "/vendor" : "/";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            if (
                showSearch &&
                searchPanelRef.current &&
                !searchPanelRef.current.contains(target) &&
                searchButtonRef.current &&
                !searchButtonRef.current.contains(target)
            ) {
                setShowSearch(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSearch]);

    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setShowSearch(false);
                setActiveMenu(null);
                setShowMobileMenu(false);
                setShowAccountMenu(false);
                setShowCartPreview(false);
            }
        }

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => {
        if (!showMobileMenu) return;

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
    }, [showMobileMenu]);

    useEffect(() => {
        const handleClick = () => {
            setShowAccountMenu(false);
        };

        window.addEventListener("click", handleClick);

        return () => {
            window.removeEventListener("click", handleClick);
        };
    }, []);

    useEffect(() => {
        function handleCartOutsideClick(event: MouseEvent) {
            if (!showCartPreview) return;

            const target = event.target as Node;

            if (
                cartPreviewRef.current?.contains(target) ||
                cartButtonRef.current?.contains(target)
            ) {
                return;
            }

            setShowCartPreview(false);
        }

        document.addEventListener("mousedown", handleCartOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleCartOutsideClick);
        };
    }, [showCartPreview]);

    useEffect(() => {
        async function loadCartCount() {
            if (!isLoggedIn || isVendorAccount) {
                setCartCount(0);
                setCart(null);
                return;
            }

            try {
                const cart = await getCart();

                const count = cart.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                );

                setCart(cart);
                setCartCount(count);
            } catch {
                setCart(null);
                setCartCount(0);
            }
        }

        loadCartCount();

        window.addEventListener("cartUpdated", loadCartCount);

        return () => {
            window.removeEventListener("cartUpdated", loadCartCount);
        };
    }, [isLoggedIn, isVendorAccount]);

    useEffect(() => {
        async function openCartPreviewFromQuickAdd() {
            if (!isLoggedIn || isVendorAccount) return;

            setShowCartPreview(true);
            setShowSearch(false);
            setActiveMenu(null);
            await loadCartPreview();
        }

        window.addEventListener("openCartPreview", openCartPreviewFromQuickAdd);

        return () => {
            window.removeEventListener(
                "openCartPreview",
                openCartPreviewFromQuickAdd
            );
        };
    }, [isLoggedIn, isVendorAccount]);

    useEffect(() => {
        async function loadWishlistCount() {
            if (!isLoggedIn || isVendorAccount) {
                setWishlistCount(0);
                return;
            }

            try {
                const wishlist = await getWishlist();
                setWishlistCount(wishlist.items.length);
            } catch {
                setWishlistCount(0);
            }
        }

        loadWishlistCount();

        window.addEventListener("wishlistUpdated", loadWishlistCount);

        return () => {
            window.removeEventListener("wishlistUpdated", loadWishlistCount);
        };
    }, [isLoggedIn, isVendorAccount]);

    function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!search.trim()) return;

        router.push(`/products?search=${encodeURIComponent(search.trim())}`);
        setShowSearch(false);
    }

    async function loadCartPreview() {
        if (!isLoggedIn) {
            setCart(null);
            setCartCount(0);
            return;
        }

        try {
            setCartPreviewLoading(true);
            const cartData = await getCart();
            const count = cartData.items.reduce(
                (total, item) => total + item.quantity,
                0
            );

            setCart(cartData);
            setCartCount(count);
        } finally {
            setCartPreviewLoading(false);
        }
    }

    async function handleCartPreviewOpen() {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        setShowCartPreview(true);
        setShowSearch(false);
        setActiveMenu(null);
        setShowMobileMenu(false);
        await loadCartPreview();
    }

    async function handleMiniCartQuantity(cartItemId: string, quantity: number) {
        const updatedCart = await updateCartItem(cartItemId, quantity);
        const count = updatedCart.items.reduce(
            (total, item) => total + item.quantity,
            0
        );

        setCart(updatedCart);
        setCartCount(count);
    }

    async function handleMiniCartRemove(cartItemId: string) {
        await removeCartItem(cartItemId);
        await loadCartPreview();
    }

    function toggleMobileGender(gender: string) {
        setOpenMobileGender((current) => ({
            ...current,
            [gender]: !current[gender],
        }));
    }

    function toggleMobileGroup(gender: string, group: string) {
        const key = `${gender}-${group}`;

        setOpenMobileGroups((current) => ({
            ...current,
            [key]: !current[key],
        }));
    }

    function isMobileGroupOpen(gender: string, group: string) {
        return openMobileGroups[`${gender}-${group}`] === true;
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-[#d8c8ad] bg-[var(--luxury-paper)]/92 text-[var(--luxury-ink)] backdrop-blur-xl">
            <div
                className={
                    isVendorAccount
                        ? "flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 md:py-4"
                        : "flex w-full items-center justify-between gap-1 px-2 py-3 sm:gap-3 sm:px-6 md:px-8 md:py-4"
                }
            >
                {!isVendorAccount && (
                    <button
                        type="button"
                        onClick={() => {
                            setShowMobileMenu((value) => {
                                const nextValue = !value;

                                if (nextValue) {
                                    setOpenMobileGender({
                                        Men: false,
                                        Women: false,
                                        Unisex: false,
                                    });
                                    setOpenMobileGroups({});
                                }

                                return nextValue;
                            });
                            setShowSearch(false);
                            setActiveMenu(null);
                        }}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:text-[var(--luxury-gold)] md:hidden"
                        aria-label="Toggle navigation menu"
                        aria-expanded={showMobileMenu}
                    >
                        {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
                    </button>
                )}

                <Link
                    href={homeHref}
                    className="mr-auto shrink-0 text-sm font-semibold tracking-[0.12em] [font-family:var(--font-serif)] min-[390px]:text-base sm:text-xl sm:tracking-[0.28em] md:mr-0"
                >
                    FRAGRANCE
                </Link>

                {!isVendorAccount && (
                <div className="hidden items-center gap-10 md:flex">
                    {["Men", "Women", "Unisex"].map((item) => (
                        <div
                            key={item}
                            onMouseEnter={() => setActiveMenu(item)}
                        >
                            <Link
                                href={`/products?gender=${item}`}
                                className={`
                                    relative pb-1 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-ink)]
                                    after:absolute after:bottom-0 after:left-0 after:h-[1.5px]
                                    after:bg-[var(--luxury-gold)] after:transition-all
                                    ${activeGender === item
                                        ? "after:w-full"
                                        : "after:w-0 hover:after:w-full"
                                    }
                                `}
                            >
                                {item}
                            </Link>
                        </div>
                    ))}
                </div>
                )}

                <div className="flex shrink-0 items-center gap-0 sm:gap-3 md:gap-5">
                    {!isVendorAccount && (
                    <>
                    <button
                        ref={searchButtonRef}
                        onClick={() => setShowSearch(true)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:text-[var(--luxury-gold)]"
                    >
                        <Search size={22} />
                    </button>

                    {isLoggedIn && (
                        <Link
                            href="/wishlist"
                            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:text-[var(--luxury-gold)]"
                        >
                            <Heart size={22} />

                            {wishlistCount > 0 && (
                                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--luxury-gold)] text-xs text-[var(--luxury-ink)]">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                    )}

                    <button
                        ref={cartButtonRef}
                        type="button"
                        onClick={handleCartPreviewOpen}
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:text-[var(--luxury-gold)]"
                    >
                        <ShoppingBag size={22} />

                        {cartCount > 0 && (
                            <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--luxury-gold)] text-xs text-[var(--luxury-ink)]">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    </>
                    )}

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();

                                if (!isLoggedIn) {
                                    router.push("/login");
                                    return;
                                }

                                setShowAccountMenu((value) => !value);
                            }}
                            className={
                                isLoggedIn
                                    ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--luxury-ink)] text-sm font-semibold text-[var(--luxury-ink)] transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
                                    : "flex h-10 w-10 shrink-0 items-center justify-center transition hover:text-[var(--luxury-gold)]"
                            }
                        >
                            {isLoggedIn && initials ? (
                                initials
                            ) : (
                                <User size={22} />
                            )}
                        </button>

                        {isLoggedIn && showAccountMenu && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-3 w-48 rounded-xl border border-[#d8c8ad] bg-[var(--luxury-paper)] p-2 shadow-[0_18px_45px_rgba(22,18,13,0.16)]"
                            >
                                {!isVendorAccount && (
                                    <>
                                        <Link
                                            href="/account"
                                            onClick={() => setShowAccountMenu(false)}
                                            className="block rounded-lg px-3 py-2 text-sm hover:bg-[#efe3d0]"
                                        >
                                            Account
                                        </Link>

                                        <Link
                                            href="/orders"
                                            onClick={() => setShowAccountMenu(false)}
                                            className="block rounded-lg px-3 py-2 text-sm hover:bg-[#efe3d0]"
                                        >
                                            My Orders
                                        </Link>
                                    </>
                                )}

                                {canUseVendorStudio && (
                                    <Link
                                        href="/vendor"
                                        onClick={() => setShowAccountMenu(false)}
                                        className="block rounded-lg px-3 py-2 text-sm hover:bg-[#efe3d0]"
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        logoutUser();
                                        setShowAccountMenu(false);
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!isVendorAccount && isMounted && showMobileMenu && createPortal(
                <div className="fixed inset-0 z-[90] overscroll-none md:hidden">
                    <button
                        type="button"
                        aria-label="Close navigation overlay"
                        onClick={() => setShowMobileMenu(false)}
                        className="absolute inset-0 bg-black/45"
                    />

                    <aside className="absolute left-0 top-0 h-full w-[86vw] max-w-[430px] overflow-y-auto overscroll-contain bg-[var(--luxury-paper)] px-5 py-6 text-[var(--luxury-ink)] shadow-[0_24px_70px_rgba(22,18,13,0.24)]">
                        <div className="mb-5 flex items-center justify-between">
                            <Link
                                href="/"
                                onClick={() => setShowMobileMenu(false)}
                                className="text-xl font-semibold tracking-[0.22em] [font-family:var(--font-serif)]"
                            >
                                FRAGRANCE
                            </Link>

                            <button
                                type="button"
                                onClick={() => setShowMobileMenu(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#efe3d0]"
                                aria-label="Close navigation menu"
                            >
                                <X size={28} strokeWidth={1.5} />
                            </button>
                        </div>

                        <nav className="text-base">
                            {["Men", "Women", "Unisex"].map((item) => (
                                <section key={item} className="border-b border-[#d8c8ad] py-4">
                                    <button
                                        type="button"
                                        onClick={() => toggleMobileGender(item)}
                                        className="flex w-full items-center justify-between text-left font-semibold uppercase tracking-[0.16em]"
                                        aria-expanded={openMobileGender[item]}
                                    >
                                        <span>{item}</span>
                                        <span aria-hidden="true">{openMobileGender[item] ? "-" : "+"}</span>
                                    </button>

                                    {openMobileGender[item] && (
                                    <div className="mt-5 grid gap-5">
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => toggleMobileGroup(item, "Fragrances")}
                                                className="mb-3 flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold)]"
                                                aria-expanded={isMobileGroupOpen(item, "Fragrances")}
                                            >
                                                <span>Fragrances</span>
                                                <span aria-hidden="true">{isMobileGroupOpen(item, "Fragrances") ? "-" : "+"}</span>
                                            </button>
                                            {isMobileGroupOpen(item, "Fragrances") && (
                                                <div className="grid gap-3 pl-3 text-sm text-[var(--luxury-muted)]">
                                                    <Link href={`/products?gender=${item}`} onClick={() => setShowMobileMenu(false)}>
                                                        Shop All
                                                    </Link>
                                                    <Link href={`/products?gender=${item}&category=Perfume`} onClick={() => setShowMobileMenu(false)}>
                                                        Perfumes
                                                    </Link>
                                                    <Link href={`/products?gender=${item}&category=Attar`} onClick={() => setShowMobileMenu(false)}>
                                                        Attars
                                                    </Link>
                                                    <Link href={`/products?gender=${item}&category=Customised%20Perfume`} onClick={() => setShowMobileMenu(false)}>
                                                        Customised Perfumes
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => toggleMobileGroup(item, "Cosmetics")}
                                                className="mb-3 flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold)]"
                                                aria-expanded={isMobileGroupOpen(item, "Cosmetics")}
                                            >
                                                <span>Cosmetics</span>
                                                <span aria-hidden="true">{isMobileGroupOpen(item, "Cosmetics") ? "-" : "+"}</span>
                                            </button>
                                            {isMobileGroupOpen(item, "Cosmetics") && (
                                                <div className="grid gap-3 pl-3 text-sm text-[var(--luxury-muted)]">
                                                    <Link href={`/products?gender=${item}&category=Face%20Wash`} onClick={() => setShowMobileMenu(false)}>
                                                        Face Wash
                                                    </Link>
                                                    <Link href={`/products?gender=${item}&category=Fairness%20Cream`} onClick={() => setShowMobileMenu(false)}>
                                                        Fairness Cream
                                                    </Link>
                                                    <Link href={`/products?gender=${item}&category=Lens`} onClick={() => setShowMobileMenu(false)}>
                                                        Lens
                                                    </Link>
                                                    <Link href={`/products?gender=${item}&category=Nails`} onClick={() => setShowMobileMenu(false)}>
                                                        Nails
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => toggleMobileGroup(item, "Brands")}
                                                className="mb-3 flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold)]"
                                                aria-expanded={isMobileGroupOpen(item, "Brands")}
                                            >
                                                <span>Brands</span>
                                                <span aria-hidden="true">{isMobileGroupOpen(item, "Brands") ? "-" : "+"}</span>
                                            </button>
                                            {isMobileGroupOpen(item, "Brands") && (
                                                <div className="grid gap-3 pl-3 text-sm text-[var(--luxury-muted)]">
                                                    <Link href="/products?search=Aurelian%20Atelier" onClick={() => setShowMobileMenu(false)}>
                                                        Aurelian Atelier
                                                    </Link>
                                                    <Link href="/products?search=Nocturne%20Vale" onClick={() => setShowMobileMenu(false)}>
                                                        Nocturne Vale
                                                    </Link>
                                                    <Link href="/products?search=Mira%20Solace" onClick={() => setShowMobileMenu(false)}>
                                                        Mira Solace
                                                    </Link>
                                                    <Link href="/products?search=Vellum%20%26%20Dew" onClick={() => setShowMobileMenu(false)}>
                                                        Vellum & Dew
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    )}
                                </section>
                            ))}
                        </nav>
                    </aside>
                </div>,
                document.body
            )}

            {!isVendorAccount && activeMenu && (
                <div
                    onMouseLeave={() => setActiveMenu(null)}
                    className="absolute left-0 top-full z-40 w-full border-t border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_22px_50px_rgba(22,18,13,0.12)]"
                >
                    <div className="mx-auto grid max-w-7xl grid-cols-4 gap-12 px-10 py-10">
                        <div>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold)]">
                                Fragrances
                            </h3>

                            <div className="space-y-3 text-sm text-[var(--luxury-muted)]">
                                <Link href={`/products?gender=${activeMenu}`} className="block transition hover:text-[var(--luxury-ink)]">
                                    Shop All
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Perfume`} className="block transition hover:text-[var(--luxury-ink)]">
                                    Perfumes
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Attar`} className="block transition hover:text-[var(--luxury-ink)]">
                                    Attars
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Customised Perfume`} className="block transition hover:text-[var(--luxury-ink)]">
                                    Customised Perfumes
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold)]">
                                Cosmetics
                            </h3>

                            <div className="space-y-3 text-sm text-[var(--luxury-muted)]">
                                <Link href={`/products?gender=${activeMenu}&category=Face Wash`} className="block transition hover:text-[var(--luxury-ink)]">
                                    Face Wash
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Fairness Cream`} className="block transition hover:text-[var(--luxury-ink)]">
                                    Fairness Cream
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Lens`} className="block transition hover:text-[var(--luxury-ink)]">
                                    Lens
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Nails`} className="block transition hover:text-[var(--luxury-ink)]">
                                    Nails
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold)]">
                                Brands
                            </h3>

                            <div className="space-y-3 text-sm text-[var(--luxury-muted)]">
                                <Link href="/products?search=Aurelian%20Atelier" className="block transition hover:text-[var(--luxury-ink)]">
                                    Aurelian Atelier
                                </Link>
                                <Link href="/products?search=Nocturne%20Vale" className="block transition hover:text-[var(--luxury-ink)]">
                                    Nocturne Vale
                                </Link>
                                <Link href="/products?search=Mira%20Solace" className="block transition hover:text-[var(--luxury-ink)]">
                                    Mira Solace
                                </Link>
                                <Link href="/products?search=Vellum%20%26%20Dew" className="block transition hover:text-[var(--luxury-ink)]">
                                    Vellum & Dew
                                </Link>
                            </div>
                        </div>

                        <div>
                            <div className="border border-[#d8c8ad] bg-[var(--luxury-ink)] p-6 text-[var(--luxury-paper)]">
                                <p className="text-xs uppercase tracking-[0.24em] text-[var(--luxury-gold)]">
                                    Featured
                                </p>

                                <h3 className="mt-2 text-2xl font-normal [font-family:var(--font-serif)]">
                                    Signature Scents
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-white/70">
                                    Discover perfumes, attars and cosmetics for every occasion.
                                </p>

                                <Link
                                    href={`/products?gender=${activeMenu}`}
                                    className="mt-5 inline-block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold)]"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isVendorAccount && showSearch && (
                <div
                    ref={searchPanelRef}
                    className="border-t border-[#d8c8ad] bg-[var(--luxury-paper)] px-6 py-6"
                >
                    <form
                        onSubmit={handleSearchSubmit}
                        className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center"
                    >
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Enter search keyword"
                            className="w-full border-b border-[var(--luxury-ink)] bg-transparent px-1 py-3 text-lg tracking-[0.12em] outline-none placeholder:text-[var(--luxury-muted)]"
                        />

                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setShowSearch(false);
                            }}
                            className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold)]"
                        >
                            Close
                        </button>
                    </form>
                </div>
            )}

            {!isVendorAccount && isMounted && showCartPreview && createPortal(
                <>
                    <button
                        type="button"
                        aria-label="Close cart preview overlay"
                        onClick={() => setShowCartPreview(false)}
                        className="fixed inset-0 z-[90] cursor-default bg-black/50"
                    />

                    <aside
                        ref={cartPreviewRef}
                        className="fixed right-0 top-0 z-[100] flex h-screen w-full max-w-[520px] flex-col border-l border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_30px_80px_rgba(22,18,13,0.24)]"
                    >
                        <div className="flex items-center justify-between border-b border-[#d8c8ad] px-4 py-4 sm:px-8 sm:py-6">
                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                Your Cart
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowCartPreview(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#efe3d0]"
                                aria-label="Close cart preview"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
                            {cartPreviewLoading ? (
                                <p className="text-sm uppercase tracking-[0.2em] text-[var(--luxury-muted)]">
                                    Loading cart...
                                </p>
                            ) : !cart || cart.items.length === 0 ? (
                                <div className="py-10 text-center">
                                    <p className="text-2xl font-normal [font-family:var(--font-serif)]">
                                        Your cart is empty
                                    </p>

                                    <Link
                                        href="/products"
                                        onClick={() => setShowCartPreview(false)}
                                        className="mt-6 inline-block rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)]"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {cart.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="grid grid-cols-[82px_1fr] gap-4 border-b border-[#d8c8ad] pb-5 sm:grid-cols-[96px_1fr_auto]"
                                        >
                                            <div className="relative h-24 overflow-hidden bg-[#efe3d0] sm:h-28">
                                                {item.imageUrl && (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.productName}
                                                        fill
                                                        className="object-contain p-3 drop-shadow-[0_16px_18px_rgba(22,18,13,0.14)]"
                                                    />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs uppercase tracking-[0.24em] text-[var(--luxury-gold)]">
                                                    {item.brandName}
                                                </p>

                                                <h3 className="mt-1 text-lg font-normal leading-tight [font-family:var(--font-serif)] sm:text-xl">
                                                    {item.productName}
                                                </h3>

                                                <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                                    {item.gender} • {item.categoryName} • {item.variantName}
                                                </p>

                                                <div className="mt-4 flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            item.quantity > 1 &&
                                                            handleMiniCartQuantity(
                                                                item.id,
                                                                item.quantity - 1
                                                            )
                                                        }
                                                        disabled={item.quantity <= 1}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c8ad] transition hover:border-[var(--luxury-gold)] disabled:opacity-40"
                                                    >
                                                        <Minus size={14} />
                                                    </button>

                                                    <span className="min-w-5 text-center text-sm font-semibold">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMiniCartQuantity(
                                                                item.id,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c8ad] transition hover:border-[var(--luxury-gold)]"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                                                <p className="font-semibold">₹{item.totalPrice}</p>

                                                <button
                                                    type="button"
                                                    onClick={() => handleMiniCartRemove(item.id)}
                                                    className="text-red-600 transition hover:text-red-700"
                                                    aria-label={`Remove ${item.productName}`}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart && cart.items.length > 0 && (
                            <div className="border-t border-[#d8c8ad] px-4 py-5 sm:px-8 sm:py-6">
                                <div className="flex items-center justify-between text-xl font-semibold">
                                    <span>Subtotal</span>
                                    <span>₹{cart.finalAmount}</span>
                                </div>

                                <Link
                                    href="/checkout"
                                    onClick={() => setShowCartPreview(false)}
                                    className="mt-6 block rounded-full bg-[var(--luxury-ink)] py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)]"
                                >
                                    Check Out Now
                                </Link>

                                <Link
                                    href="/cart"
                                    onClick={() => setShowCartPreview(false)}
                                    className="mt-3 block rounded-full border border-[#d8c8ad] py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] transition hover:border-[var(--luxury-gold)]"
                                >
                                    View Cart
                                </Link>
                            </div>
                        )}
                    </aside>
                </>,
                document.body
            )}
        </nav>
    );
}
