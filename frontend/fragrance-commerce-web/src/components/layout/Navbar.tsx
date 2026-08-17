"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Heart, MapPin, Menu, Minus, Plus, Search, ShoppingBag, Trash2, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { getCart, removeCartItem, updateCartItem } from "@/services/cartService";
import { getWishlist } from "@/services/wishlistService";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { Cart } from "@/types/cart";
import { EmptyState } from "@/components/common/EmptyState";

const subscribeToMounted = () => () => {};

export default function Navbar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { isLoggedIn, logoutUser, initials, email, roles } = useAuth();

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
    const isMounted = useSyncExternalStore(
        subscribeToMounted,
        () => true,
        () => false
    );
    const [scrolled, setScrolled] = useState(false);

    const searchPanelRef = useRef<HTMLDivElement>(null);
    const searchButtonRef = useRef<HTMLButtonElement>(null);
    const cartPreviewRef = useRef<HTMLElement>(null);
    const cartButtonRef = useRef<HTMLButtonElement>(null);
    const mobileMenuRef = useRef<HTMLElement>(null);
    const genderMenuRef = useRef<HTMLDivElement>(null);
    const genderCloseTimer = useRef<number | null>(null);

    const scheduleGenderClose = () => {
        if (genderCloseTimer.current) window.clearTimeout(genderCloseTimer.current);
        genderCloseTimer.current = window.setTimeout(() => setActiveMenu(null), 150);
    };

    const cancelGenderClose = () => {
        if (genderCloseTimer.current) {
            window.clearTimeout(genderCloseTimer.current);
            genderCloseTimer.current = null;
        }
    };

    useFocusTrap(mobileMenuRef, showMobileMenu, () => setShowMobileMenu(false));
    useFocusTrap(cartPreviewRef, showCartPreview, () => setShowCartPreview(false));

    const activeGender = searchParams.get("gender");
    const canUseVendorStudio =
        roles.includes("Vendor") ||
        roles.includes("Admin") ||
        roles.includes("SuperAdmin");
    const isVendorAccount = roles.includes("Vendor");
    const homeHref = isVendorAccount ? "/vendor" : "/";

    useEffect(() => {
        let ticking = false;

        function handleScroll() {
            if (ticking) return;

            ticking = true;

            requestAnimationFrame(() => {
                setScrolled(window.scrollY > 8);
                ticking = false;
            });
        }

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
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
        <nav
            aria-label="Main"
            className={`sticky top-0 z-50 border-b border-[#d8c8ad] bg-[var(--luxury-paper)]/92 text-[var(--luxury-ink)] backdrop-blur-xl transition-shadow duration-300 ${scrolled ? "shadow-[0_14px_34px_rgba(22,18,13,0.1)]" : ""}`}
        >
            <div
                className={
                    isVendorAccount
                        ? "flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 md:py-4"
                        : "flex w-full items-center justify-between gap-0.5 px-1.5 py-3 min-[375px]:gap-1 min-[375px]:px-2 sm:gap-3 sm:px-6 md:px-8 md:py-4"
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
                        aria-controls="mobile-menu"
                    >
                        {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
                    </button>
                )}

                <Link
                    href={homeHref}
                    className="-my-2.5 py-2.5 mr-auto shrink-0 text-sm font-semibold tracking-[0.12em] [font-family:var(--font-serif)] min-[390px]:text-base sm:text-xl sm:tracking-[0.28em] md:mr-0"
                >
                    FRAGRANCE
                </Link>

                {!isVendorAccount && (
                <div className="hidden items-center gap-11 md:flex">
                    {["Men", "Women", "Unisex"].map((item) => (
                        <div
                            key={item}
                            onMouseEnter={() => {
                                cancelGenderClose();
                                setActiveMenu(item);
                            }}
                            onMouseLeave={scheduleGenderClose}
                            className="group"
                        >
                            <Link
                                href={`/products?gender=${item}`}
                                data-gender={item}
                                onFocus={() => setActiveMenu(item)}
                                onBlur={(e) => {
                                    const next = e.relatedTarget as Node | null;
                                    if (next && genderMenuRef.current?.contains(next)) return;
                                    setActiveMenu(null);
                                }}
                                aria-haspopup="true"
                                aria-expanded={activeMenu === item}
                                aria-controls="gender-mega-menu"
                                className={`
                                    relative -my-3 py-3 px-0.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-ink)]
                                    transition-colors duration-200 group-hover:text-[var(--luxury-gold)]
                                    after:absolute after:bottom-2 after:left-0 after:h-[1.5px]
                                    after:bg-[var(--luxury-gold)] after:transition-all after:duration-300
                                    ${activeGender === item || activeMenu === item
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
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 hover:text-[var(--luxury-gold)] active:scale-90"
                        aria-label="Open search"
                        aria-expanded={showSearch}
                        aria-controls="search-panel"
                    >
                        <Search size={22} />
                    </button>

                    {isLoggedIn && (
                        <Link
                            href="/wishlist"
                            aria-label="View wishlist"
                            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 hover:text-[var(--luxury-gold)] active:scale-90"
                        >
                            <Heart size={22} />

                            {wishlistCount > 0 && (
                                <motion.span
                                    key={wishlistCount}
                                    initial={{ scale: 0.4, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--luxury-gold)] text-xs text-[var(--luxury-ink)]"
                                >
                                    {wishlistCount}
                                </motion.span>
                            )}
                        </Link>
                    )}

                    <button
                        ref={cartButtonRef}
                        type="button"
                        onClick={handleCartPreviewOpen}
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 hover:text-[var(--luxury-gold)] active:scale-90"
                        aria-label="View cart"
                        aria-expanded={showCartPreview}
                        aria-controls="cart-preview"
                    >
                        <ShoppingBag size={22} />

                        {cartCount > 0 && (
                            <motion.span
                                key={cartCount}
                                initial={{ scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--luxury-gold)] text-xs text-[var(--luxury-ink)]"
                            >
                                {cartCount}
                            </motion.span>
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
                        aria-label={isLoggedIn ? "Account menu" : "Sign in"}
                        aria-haspopup={isLoggedIn ? "menu" : undefined}
                        aria-expanded={isLoggedIn ? showAccountMenu : undefined}
                        aria-controls={isLoggedIn ? "account-menu" : undefined}
                        className={
                            isLoggedIn
                                ? "flex h-10 w-10 shrink-0 items-center justify-center transition-all duration-200 ease-out hover:scale-105 active:scale-90"
                                : "flex h-10 w-10 shrink-0 items-center justify-center transition-all duration-200 ease-out hover:text-[var(--luxury-gold)] hover:scale-105 active:scale-90"
                        }
                    >
                        {isLoggedIn && initials ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--luxury-ink)] text-xs font-semibold text-[var(--luxury-paper)] transition-colors duration-200 hover:bg-[var(--luxury-gold)] hover:text-[var(--luxury-ink)]">
                                {initials}
                            </span>
                        ) : (
                            <User size={22} />
                        )}
                    </button>

                        <AnimatePresence>
                            {isLoggedIn && showAccountMenu && (
                                <motion.div
                                    key="account-menu"
                                    id="account-menu"
                                    role="menu"
                                    aria-label="Account menu"
                                    onKeyDown={(e) => {
                                        const items = Array.from(
                                            e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]')
                                        );
                                        const index = items.indexOf(document.activeElement as HTMLElement);
                                        if (e.key === "ArrowDown" && items[index + 1]) {
                                            e.preventDefault();
                                            items[index + 1].focus();
                                        } else if (e.key === "ArrowUp" && items[index - 1]) {
                                            e.preventDefault();
                                            items[index - 1].focus();
                                        } else if (e.key === "Home" && items[0]) {
                                            e.preventDefault();
                                            items[0].focus();
                                        } else if (e.key === "End" && items.length) {
                                            e.preventDefault();
                                            items[items.length - 1].focus();
                                        }
                                    }}
                                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-3 w-60 origin-top-right rounded-xl border border-[#d8c8ad] bg-[var(--luxury-paper)] p-2 shadow-[0_18px_45px_rgba(22,18,13,0.16)]"
                                >
                                    <div className="border-b border-[#d8c8ad] px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--luxury-gold)] text-sm font-semibold text-[var(--luxury-gold)]">
                                                {initials}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[var(--luxury-ink)]">
                                                    My Account
                                                </p>
                                                <p className="truncate text-xs text-[var(--luxury-muted)]">
                                                    {email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {!isVendorAccount && (
                                        <>
                                            <Link
                                                href="/account"
                                                role="menuitem"
                                                onClick={() => setShowAccountMenu(false)}
                                                className="block rounded-lg px-3 py-2 text-sm font-normal transition-all duration-200 hover:bg-[#efe3d0] hover:translate-x-1"
                                            >
                                                Account
                                            </Link>

                                            <Link
                                                href="/orders"
                                                role="menuitem"
                                                onClick={() => setShowAccountMenu(false)}
                                                className="block rounded-lg px-3 py-2 text-sm font-normal transition-all duration-200 hover:bg-[#efe3d0] hover:translate-x-1"
                                            >
                                                My Orders
                                            </Link>
                                        </>
                                    )}

                                    {canUseVendorStudio && (
                                        <Link
                                            href="/vendor"
                                            role="menuitem"
                                            onClick={() => setShowAccountMenu(false)}
                                            className="block rounded-lg px-3 py-2 text-sm font-normal transition-all duration-200 hover:bg-[#efe3d0] hover:translate-x-1"
                                        >
                                            Dashboard
                                        </Link>
                                    )}

                                    <button
                                        role="menuitem"
                                        onClick={() => {
                                            logoutUser();
                                            setShowAccountMenu(false);
                                        }}
                                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-normal text-red-700 transition-all duration-200 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {!isVendorAccount && isMounted && createPortal(
                <AnimatePresence>
                    {showMobileMenu && (
                        <motion.div
                            key="mobile-menu"
                            className="fixed inset-0 z-[90] overscroll-none md:hidden"
                        >
                            <motion.button
                                type="button"
                                aria-label="Close navigation overlay"
                                onClick={() => setShowMobileMenu(false)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0 bg-black/45"
                            />

                            <motion.aside
                                ref={mobileMenuRef}
                                id="mobile-menu"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Navigation menu"
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute left-0 top-0 h-full w-[86vw] max-w-[430px] overflow-y-auto overscroll-contain bg-[var(--luxury-paper)] px-5 py-6 text-[var(--luxury-ink)] shadow-[0_24px_70px_rgba(22,18,13,0.24)]"
                            >
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

                                <nav aria-label="Mobile navigation" className="text-base">
                                    {["Men", "Women", "Unisex"].map((item) => (
                                        <section key={item} className="border-b border-[#d8c8ad] py-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleMobileGender(item)}
                                                className="group flex w-full items-center justify-between text-left font-semibold uppercase tracking-[0.16em] transition-colors duration-200 hover:text-[var(--luxury-gold)]"
                                                aria-expanded={openMobileGender[item]}
                                            >
                                                <span>{item}</span>
                                                <ChevronDown
                                                    size={18}
                                                    className={`shrink-0 transition-transform duration-200 ${openMobileGender[item] ? "rotate-180 text-[var(--luxury-gold)]" : "text-[var(--luxury-muted)] group-hover:text-[var(--luxury-gold)]"}`}
                                                />
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {openMobileGender[item] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-5 grid gap-5 pl-4">
                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleMobileGroup(item, "Fragrances")}
                                                                    className="mb-3 flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)]"
                                                                    aria-expanded={isMobileGroupOpen(item, "Fragrances")}
                                                                >
                                                                    <span>Fragrances</span>
                                                                    <ChevronDown
                                                                        size={16}
                                                                        className={`shrink-0 transition-transform duration-200 ${isMobileGroupOpen(item, "Fragrances") ? "rotate-180" : ""}`}
                                                                    />
                                                                </button>
                                                                <AnimatePresence initial={false}>
                                                                    {isMobileGroupOpen(item, "Fragrances") && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="grid gap-3 pl-3 text-sm text-[var(--luxury-muted)]">
                                                                                <Link href={`/products?gender=${item}`} onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Shop All
                                                                                </Link>
                                                                                <Link href={`/products?gender=${item}&category=Perfume`} onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Perfumes
                                                                                </Link>
                                                                                <Link href={`/products?gender=${item}&category=Attar`} onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Attars
                                                                                </Link>
                                                                                <Link href={`/products?gender=${item}&category=Customised%20Perfume`} onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Customised Perfumes
                                                                                </Link>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>

                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleMobileGroup(item, "Cosmetics")}
                                                                    className="mb-3 flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)]"
                                                                    aria-expanded={isMobileGroupOpen(item, "Cosmetics")}
                                                                >
                                                                    <span>Cosmetics</span>
                                                                    <ChevronDown
                                                                        size={16}
                                                                        className={`shrink-0 transition-transform duration-200 ${isMobileGroupOpen(item, "Cosmetics") ? "rotate-180" : ""}`}
                                                                    />
                                                                </button>
                                                                <AnimatePresence initial={false}>
                                                                    {isMobileGroupOpen(item, "Cosmetics") && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="grid gap-3 pl-3 text-sm text-[var(--luxury-muted)]">
                                                                                <Link href={`/products?gender=${item}&category=Face%20Wash`} onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Face Wash
                                                                                </Link>
                                                                                <Link href={`/products?gender=${item}&category=Fairness%20Cream`} onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Fairness Cream
                                                                                </Link>
                                                                                <Link href={`/products?gender=${item}&category=Lens`} onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Lens
                                                                                </Link>
                                                                                <Link href={`/products?gender=${item}&category=Nails`} onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Nails
                                                                                </Link>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>

                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleMobileGroup(item, "Brands")}
                                                                    className="mb-3 flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)]"
                                                                    aria-expanded={isMobileGroupOpen(item, "Brands")}
                                                                >
                                                                    <span>Brands</span>
                                                                    <ChevronDown
                                                                        size={16}
                                                                        className={`shrink-0 transition-transform duration-200 ${isMobileGroupOpen(item, "Brands") ? "rotate-180" : ""}`}
                                                                    />
                                                                </button>
                                                                <AnimatePresence initial={false}>
                                                                    {isMobileGroupOpen(item, "Brands") && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="grid gap-3 pl-3 text-sm text-[var(--luxury-muted)]">
                                                                                <Link href="/products?search=Aurelian%20Atelier" onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Aurelian Atelier
                                                                                </Link>
                                                                                <Link href="/products?search=Nocturne%20Vale" onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Nocturne Vale
                                                                                </Link>
                                                                                <Link href="/products?search=Mira%20Solace" onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Mira Solace
                                                                                </Link>
                                                                                <Link href="/products?search=Vellum%20%26%20Dew" onClick={() => setShowMobileMenu(false)} className="transition-colors duration-200 hover:text-[var(--luxury-ink)]">
                                                                                    Vellum & Dew
                                                                                </Link>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </section>
                                    ))}
                                </nav>
                            </motion.aside>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {!isVendorAccount && (
                <AnimatePresence>
                    {activeMenu && (
                    <motion.div
                        key={activeMenu}
                        ref={genderMenuRef}
                        id="gender-mega-menu"
                        role="group"
                        aria-label={`${activeMenu} menu`}
                        onMouseEnter={cancelGenderClose}
                        onMouseLeave={scheduleGenderClose}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 top-full z-40 w-full origin-top border-t border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_22px_50px_rgba(22,18,13,0.12)]"
                    >
                    <div className="mx-auto grid max-w-7xl grid-cols-4 gap-12 px-10 py-10">
                        <div>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)]">
                                Fragrances
                            </h3>

                            <div className="space-y-3 text-sm text-[var(--luxury-muted)]">
                                <Link href={`/products?gender=${activeMenu}`} className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Shop All
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Perfume`} className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Perfumes
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Attar`} className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Attars
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Customised Perfume`} className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Customised Perfumes
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)]">
                                Cosmetics
                            </h3>

                            <div className="space-y-3 text-sm text-[var(--luxury-muted)]">
                                <Link href={`/products?gender=${activeMenu}&category=Face Wash`} className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Face Wash
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Fairness Cream`} className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Fairness Cream
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Lens`} className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Lens
                                </Link>
                                <Link href={`/products?gender=${activeMenu}&category=Nails`} className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Nails
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)]">
                                Brands
                            </h3>

                            <div className="space-y-3 text-sm text-[var(--luxury-muted)]">
                                <Link href="/products?search=Aurelian%20Atelier" className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Aurelian Atelier
                                </Link>
                                <Link href="/products?search=Nocturne%20Vale" className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Nocturne Vale
                                </Link>
                                <Link href="/products?search=Mira%20Solace" className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
                                    Mira Solace
                                </Link>
                                <Link href="/products?search=Vellum%20%26%20Dew" className="block transition-all duration-200 hover:translate-x-1 hover:text-[var(--luxury-gold)]">
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
                                    className="mt-5 inline-block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold)] transition-colors duration-200 hover:text-[var(--luxury-paper)]"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                    </motion.div>
                    )}
                </AnimatePresence>
            )}

            {!isVendorAccount && (
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            key="search-panel"
                            id="search-panel"
                            ref={searchPanelRef}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden border-t border-[#d8c8ad] bg-[var(--luxury-paper)]"
                        >
                            <div className="px-6 py-6">
                                <form
                                    role="search"
                                    onSubmit={handleSearchSubmit}
                                    className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center"
                                >
                                    <input
                                        autoFocus
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Enter search keyword"
                                        aria-label="Search products"
                                        className="w-full border-b border-[var(--luxury-ink)] bg-transparent px-1 py-2 text-sm tracking-[0.12em] outline-none transition-colors duration-200 focus:border-[var(--luxury-gold)] placeholder:text-[var(--luxury-muted-strong)] sm:py-2.5 sm:text-base"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            setShowSearch(false);
                                        }}
                                        className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] transition-colors duration-200 hover:text-[var(--luxury-ink)]"
                                    >
                                        Close
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                        id="cart-preview"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cart-preview-title"
                        className="fixed right-0 top-0 z-[100] flex h-screen w-full max-w-[520px] flex-col border-l border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_30px_80px_rgba(22,18,13,0.24)]"
                    >
                        <div className="flex items-center justify-between border-b border-[#d8c8ad] px-4 py-4 sm:px-8 sm:py-6">
                            <h2 id="cart-preview-title" className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
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
                                <EmptyState
                                    icon={ShoppingBag}
                                    title="Your cart is empty"
                                    description="Discover fragrances to add to your collection."
                                    actionLabel="Continue Shopping"
                                    actionHref="/products"
                                    onAction={() => setShowCartPreview(false)}
                                    compact
                                />
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
                                                        alt=""
                                                        fill
                                                        className="object-contain p-3 drop-shadow-[0_16px_18px_rgba(22,18,13,0.14)]"
                                                    />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">
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
                                                        aria-label={`Decrease quantity of ${item.productName}`}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c8ad] transition-all duration-200 hover:scale-105 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] active:scale-90 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:border-[#d8c8ad] disabled:hover:text-current"
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
                                                        aria-label={`Increase quantity of ${item.productName}`}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c8ad] transition-all duration-200 hover:scale-105 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] active:scale-90"
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
