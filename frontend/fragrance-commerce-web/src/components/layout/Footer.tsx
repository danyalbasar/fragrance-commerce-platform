"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const shopLinks = [
    { label: "Men", href: "/products?gender=Men" },
    { label: "Women", href: "/products?gender=Women" },
    { label: "Unisex", href: "/products?gender=Unisex" },
    { label: "Perfumes", href: "/products?category=Perfume" },
    { label: "Skincare", href: "/products?category=Face%20Wash" },
];

const accountLinks = [
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
    { label: "Orders", href: "/orders" },
    { label: "Sign in", href: "/login" },
];

const helpLinks = [
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "FAQ", href: "/faq" },
];

export default function Footer() {
    const { roles } = useAuth();

    if (roles.includes("Vendor")) {
        return null;
    }

    return (
        <footer className="border-t border-[#d8c8ad] bg-[var(--luxury-ink)] text-[var(--luxury-paper)]">
            <div className="mx-auto max-w-[1800px] px-4 py-12 sm:px-6 md:px-10 lg:py-16">
                <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
                    <section>
                        <Link
                            href="/"
                            className="text-2xl font-semibold uppercase tracking-[0.18em] [font-family:var(--font-serif)] sm:text-3xl sm:tracking-[0.34em]"
                        >
                            Fragrance
                        </Link>

                        <p className="mt-5 max-w-md text-sm leading-7 text-white/68">
                            A polished catalogue for private house fragrance, skincare, and ritual objects designed for daily discovery.
                        </p>

                        <div className="mt-8 h-px w-28 bg-[var(--luxury-gold)]" />
                    </section>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:contents">
                        <FooterColumn title="Shop">
                            {shopLinks.map((link) => (
                                <FooterLink key={link.href} href={link.href}>
                                    {link.label}
                                </FooterLink>
                            ))}
                        </FooterColumn>

                        <FooterColumn title="Account">
                            {accountLinks.map((link) => (
                                <FooterLink key={link.href} href={link.href}>
                                    {link.label}
                                </FooterLink>
                            ))}
                        </FooterColumn>

                        <FooterColumn title="Help">
                            {helpLinks.map((link) => (
                                <FooterLink key={link.href} href={link.href}>
                                    {link.label}
                                </FooterLink>
                            ))}
                        </FooterColumn>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.12em] text-white/48 sm:tracking-[0.22em] md:flex-row md:items-center md:justify-between">
                    <p>Copyright {new Date().getFullYear()} Fragrance Commerce</p>
                    <p>Luxury catalogue experience</p>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--luxury-gold)]">
                {title}
            </p>

            <nav className="mt-5 flex flex-col gap-3 text-sm text-white/68">
                {children}
            </nav>
        </section>
    );
}

function FooterLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="transition hover:translate-x-1 hover:text-[var(--luxury-gold)]"
        >
            {children}
        </Link>
    );
}
