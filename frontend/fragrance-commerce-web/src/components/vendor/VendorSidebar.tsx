"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Boxes,
    ClipboardList,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/vendor", label: "Home", icon: BarChart3, exact: true },
    { href: "/vendor/products", label: "Products", icon: Boxes },
    { href: "/vendor/orders", label: "Orders", icon: ClipboardList },
    { href: "/vendor/settings", label: "Settings", icon: Settings },
];

export default function VendorSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    function isActive(href: string, exact?: boolean) {
        return exact ? pathname === href : pathname.startsWith(href);
    }

    const sidebarContent = (
        <nav className="flex flex-col gap-0.5 px-2 py-1">
            {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            active
                                ? "bg-[var(--luxury-ink)] text-white"
                                : "text-gray-700 hover:bg-gray-100"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={item.label}
                    >
                        <item.icon size={20} strokeWidth={active ? 2 : 1.5} />
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm lg:hidden"
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:hidden ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
                    <Link href="/vendor" onClick={() => setMobileOpen(false)} className="text-base font-semibold text-gray-900">
                        Fragrance Studio
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-50/50 transition-all duration-200 ${
                    collapsed ? "lg:w-[68px]" : "lg:w-60"
                }`}
            >
                <div className={`flex h-16 items-center border-b border-gray-200 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
                    {!collapsed && (
                        <Link href="/vendor" className="text-base font-semibold text-gray-900">
                            Fragrance Studio
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => setCollapsed((v) => !v)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                </div>
                {sidebarContent}
            </aside>
        </>
    );
}
