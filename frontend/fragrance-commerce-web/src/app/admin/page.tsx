"use client";

import Link from "next/link";
import { Tag, Image, Palette } from "lucide-react";

const cards = [
    { href: "/admin/categories", label: "Categories", icon: Tag, description: "Create and manage product categories" },
    { href: "/admin/brands", label: "Brands", icon: Tag, description: "Manage brand listings and logos" },
    { href: "/admin/genders", label: "Genders", icon: Tag, description: "Manage available gender options" },
    { href: "/admin/homepage", label: "Online Store", icon: Image, description: "Edit homepage, product pages, and storefront content" },
    { href: "/admin/themes", label: "Themes", icon: Palette, description: "Switch site theme and preview colors" },
];

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                    Admin Studio
                </p>
                <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                    Dashboard
                </h1>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="group border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_18px_50px_rgba(22,18,13,0.08)] transition hover:border-[var(--luxury-gold)] hover:shadow-[0_18px_50px_rgba(22,18,13,0.14)]"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8ad] text-[var(--luxury-gold)] group-hover:border-[var(--luxury-gold)]">
                                <Icon size={18} />
                            </div>
                            <p className="text-lg font-semibold [font-family:var(--font-serif)]">
                                {card.label}
                            </p>
                            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                {card.description}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
