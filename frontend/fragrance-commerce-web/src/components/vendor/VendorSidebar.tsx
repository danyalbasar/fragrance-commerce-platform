"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BarChart3,
    Boxes,
    ChevronDown,
    ClipboardList,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    X,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
    { href: "/vendor", label: "Overview", icon: BarChart3, exact: true },
    { href: "/vendor/products", label: "Products", icon: Boxes },
    { href: "/vendor/orders", label: "Orders", icon: ClipboardList },
];

export default function VendorSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const { logoutUser, initials, email } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleLogout() {
        logoutUser();
    }

    function isActive(href: string, exact?: boolean) {
        return exact ? pathname === href : pathname.startsWith(href);
    }

    function closeAll() {
        setShowProfileMenu(false);
        setMobileOpen(false);
    }

    const profileSection = (
        <div className="relative border-t border-[var(--luxury-line)] px-1 py-2" ref={profileMenuRef}>
            <button
                type="button"
                onClick={() => setShowProfileMenu((v) => !v)}
                className={`flex w-full items-center gap-2 rounded-md px-1 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-[var(--luxury-sand)] ${collapsed ? "justify-center" : ""}`}
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--luxury-ink)] text-[11px] font-bold uppercase tracking-wider text-[var(--luxury-paper)]">
                    {initials || "?"}
                </div>
                {!collapsed && (
                    <>
                        <span className="min-w-0 flex-1 truncate text-left text-[var(--luxury-ink)]">
                            {email || "Vendor"}
                        </span>
                        <ChevronDown
                            size={14}
                            className={`shrink-0 text-[var(--luxury-muted)] transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
                        />
                    </>
                )}
            </button>

            {showProfileMenu && (
                <div className={`absolute bottom-full ${collapsed ? "left-2 w-48" : "left-3 right-3"} mb-1 border border-[var(--luxury-line)] bg-[var(--luxury-paper)] py-1 shadow-lg`}>
                    <Link
                        href="/vendor/settings"
                        onClick={closeAll}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--luxury-ink)] hover:bg-[var(--luxury-sand)]"
                    >
                        <Settings size={16} />
                        Settings
                    </Link>
                    <button
                        type="button"
                        onClick={() => { handleLogout(); closeAll(); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50"
                    >
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );

    const sidebarContent = (
        <nav className="flex flex-1 flex-col gap-1 px-3 pt-4 pb-2">
            {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                            active
                                ? "bg-[var(--luxury-ink)] text-[var(--luxury-paper)]"
                                : "text-[var(--luxury-muted)] hover:bg-[var(--luxury-sand)] hover:text-[var(--luxury-ink)]"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={item.label}
                    >
                        <item.icon size={18} strokeWidth={active ? 2 : 1.5} />
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                );
            })}

            <div className="mt-auto">
                {profileSection}
            </div>
        </nav>
    );

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--luxury-line)] bg-[var(--luxury-paper)] transition-transform duration-200 lg:hidden ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-[var(--luxury-line)] px-4">
                    <Link href="/vendor" onClick={() => setMobileOpen(false)} className="text-base font-semibold text-[var(--luxury-ink)]">
                        Vendor Studio
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--luxury-muted)] hover:bg-[var(--luxury-sand)]"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-[var(--luxury-line)] lg:bg-[var(--luxury-paper)] transition-all duration-200 ${
                    collapsed ? "lg:w-[68px]" : "lg:w-60"
                }`}
            >
                <div className={`flex h-16 items-center border-b border-[var(--luxury-line)] ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
                    {!collapsed && (
                        <Link href="/vendor" className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)]">
                            Vendor Studio
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => setCollapsed((v) => !v)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--luxury-line)] bg-[var(--luxury-ivory)] text-[var(--luxury-ink)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-colors"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                    </button>
                </div>
                {sidebarContent}
            </aside>
        </>
    );
}
