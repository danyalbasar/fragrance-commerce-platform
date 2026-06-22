"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCart } from "@/services/cartService";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { isLoggedIn, logoutUser, initials } = useAuth();

    const [showSearch, setShowSearch] = useState(false);
    const [search, setSearch] = useState("");
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const activeGender = searchParams.get("gender");

    const [cartCount, setCartCount] = useState(0);

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
        async function loadCartCount() {
            if (!isLoggedIn) {
                setCartCount(0);
                return;
            }

            try {
                const cart = await getCart();

                const count = cart.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                );

                setCartCount(count);
            } catch {
                setCartCount(0);
            }
        }

        loadCartCount();

        window.addEventListener("cartUpdated", loadCartCount);

        return () => {
            window.removeEventListener("cartUpdated", loadCartCount);
        };
    }, [isLoggedIn]);

    function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!search.trim()) return;

        router.push(`/products?search=${encodeURIComponent(search.trim())}`);
        setShowSearch(false);
    }

    return (
        <nav className="relative sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="text-xl font-semibold tracking-[0.2em]"
                >
                    FRAGRANCE
                </Link>

                <div className="hidden items-center gap-10 md:flex">
                    {["Men", "Women", "Unisex"].map((item) => (
                        <div
                            key={item}
                            onMouseEnter={() => setActiveMenu(item)}
                        >
                            <Link
                                href={`/products?gender=${item}`}
                                className={`
                                    relative pb-1 text-sm font-medium text-black
                                    after:absolute after:bottom-0 after:left-0 after:h-[1.5px]
                                    after:bg-black after:transition-all
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

                <div className="flex items-center gap-5">
                    <button
                        onClick={() => setShowSearch(true)}
                        className="flex h-10 w-10 items-center justify-center hover:text-gray-500"
                    >
                        <Search size={22} />
                    </button>

                    <Link
                        href="/cart"
                        className="relative flex h-10 w-10 items-center justify-center hover:text-gray-500"
                    >
                        <ShoppingBag size={22} />

                        {cartCount > 0 && (
                            <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

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
                                    ? "flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white"
                                    : "flex h-10 w-10 items-center justify-center hover:text-gray-500"
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
                                className="absolute right-0 mt-3 w-48 rounded-xl border bg-white p-2 shadow-lg"
                            >
                                <Link
                                    href="/account"
                                    onClick={() => setShowAccountMenu(false)}
                                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    Account
                                </Link>

                                <Link
                                    href="/orders"
                                    onClick={() => setShowAccountMenu(false)}
                                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    My Orders
                                </Link>

                                <button
                                    onClick={() => {
                                        logoutUser();
                                        setShowAccountMenu(false);
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {activeMenu && (
                <div
                    onMouseLeave={() => setActiveMenu(null)}
                    className="absolute left-0 top-full z-40 w-full border-t bg-white shadow-sm"
                >
                    <div className="mx-auto grid max-w-7xl grid-cols-4 gap-12 px-10 py-10">
                        <div>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                                Fragrances
                            </h3>

                            <div className="space-y-3 text-sm">
                                <Link
                                    href={`/products?gender=${activeMenu}`}
                                    className="block hover:underline"
                                >
                                    Shop All
                                </Link>

                                <Link
                                    href={`/products?gender=${activeMenu}&category=Perfume`}
                                    className="block hover:underline"
                                >
                                    Perfumes
                                </Link>

                                <Link
                                    href={`/products?gender=${activeMenu}&category=Attar`}
                                    className="block hover:underline"
                                >
                                    Attars
                                </Link>

                                <Link
                                    href={`/products?gender=${activeMenu}&category=Customised Perfume`}
                                    className="block hover:underline"
                                >
                                    Customised Perfumes
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                                Cosmetics
                            </h3>

                            <div className="space-y-3 text-sm">
                                <Link
                                    href={`/products?gender=${activeMenu}&category=Face Wash`}
                                    className="block hover:underline"
                                >
                                    Face Wash
                                </Link>

                                <Link
                                    href={`/products?gender=${activeMenu}&category=Fairness Cream`}
                                    className="block hover:underline"
                                >
                                    Fairness Cream
                                </Link>

                                <Link
                                    href={`/products?gender=${activeMenu}&category=Lens`}
                                    className="block hover:underline"
                                >
                                    Lens
                                </Link>

                                <Link
                                    href={`/products?gender=${activeMenu}&category=Nails`}
                                    className="block hover:underline"
                                >
                                    Nails
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                                Brands
                            </h3>

                            <div className="space-y-3 text-sm">
                                <Link href="/products" className="block hover:underline">
                                    Dior
                                </Link>

                                <Link href="/products" className="block hover:underline">
                                    Chanel
                                </Link>

                                <Link href="/products" className="block hover:underline">
                                    Tom Ford
                                </Link>

                                <Link href="/products" className="block hover:underline">
                                    Yves Saint Laurent
                                </Link>
                            </div>
                        </div>

                        <div>
                            <div className="rounded-2xl bg-neutral-100 p-6">
                                <p className="text-xs uppercase tracking-widest text-gray-500">
                                    Featured
                                </p>

                                <h3 className="mt-2 text-xl font-semibold">
                                    Signature Scents
                                </h3>

                                <p className="mt-2 text-sm text-gray-600">
                                    Discover perfumes, attars and cosmetics for every occasion.
                                </p>

                                <Link
                                    href={`/products?gender=${activeMenu}`}
                                    className="mt-5 inline-block text-sm font-semibold underline"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSearch && (
                <div className="border-t bg-white px-6 py-6">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="mx-auto flex max-w-3xl items-center gap-4"
                    >
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Enter Search Keyword"
                            className="w-full border-b border-black bg-transparent px-1 py-3 text-lg tracking-widest outline-none"
                        />

                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setShowSearch(false);
                            }}
                            className="text-sm font-semibold underline"
                        >
                            Close
                        </button>
                    </form>
                </div>
            )}
        </nav>
    );
}