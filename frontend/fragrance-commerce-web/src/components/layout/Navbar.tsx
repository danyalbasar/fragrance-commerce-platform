"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
    const { isLoggedIn, logoutUser } = useAuth();

    return (
        <nav className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href="/" className="text-xl font-bold tracking-wide">
                    Fragrance Commerce
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/products" className="text-sm font-medium hover:text-gray-500">
                        Products
                    </Link>

                    <Link href="/cart" className="text-sm font-medium hover:text-gray-500">
                        Cart
                    </Link>

                    <Link href="/orders" className="text-sm font-medium hover:text-gray-500">
                        Orders
                    </Link>

                    {isLoggedIn ? (
                        <button
                            onClick={logoutUser}
                            className="rounded-full bg-black px-4 py-2 text-sm text-white"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full bg-black px-4 py-2 text-sm text-white"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}