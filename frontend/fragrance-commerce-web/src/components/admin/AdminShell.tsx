"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Tag, Palette, Image, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/categories", label: "Categories", icon: Tag },
    { href: "/admin/brands", label: "Brands", icon: Tag },
    { href: "/admin/genders", label: "Genders", icon: Tag },
    { href: "/admin/homepage", label: "Online Store", icon: Image },
    { href: "/admin/themes", label: "Themes", icon: Palette },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logoutUser } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isEditor = pathname === "/admin/homepage/editor";

    function isActive(href: string) {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    }

    if (isEditor) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[var(--luxury-ivory)] text-[var(--luxury-ink)]">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#d8c8ad] bg-[var(--luxury-paper)] transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-[#d8c8ad] px-5 py-5">
                        <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                            Admin Studio
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden text-[var(--luxury-muted)] hover:text-[var(--luxury-ink)]"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        active
                                            ? "bg-[var(--luxury-ink)] text-[var(--luxury-paper)]"
                                            : "text-[var(--luxury-muted)] hover:bg-[var(--luxury-sand)] hover:text-[var(--luxury-ink)]"
                                    }`}
                                >
                                    <Icon size={16} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-[#d8c8ad] px-3 py-3">
                        <Link
                            href="/"
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--luxury-muted)] hover:bg-[var(--luxury-sand)] hover:text-[var(--luxury-ink)]"
                        >
                            <Image size={16} />
                            View Store
                        </Link>
                        <button
                            type="button"
                            onClick={() => logoutUser()}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--luxury-muted)] hover:bg-[var(--luxury-sand)] hover:text-[var(--luxury-ink)]"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0 overflow-x-hidden">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-sm lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu size={18} />
                    </button>
                    {children}
                </div>
            </main>
        </div>
    );
}
