"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AtSign, Camera, CirclePlay, MessagesSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const socialLinks = [
    { label: "Instagram", href: "https://instagram.com", icon: Camera },
    { label: "Facebook", href: "https://facebook.com", icon: MessagesSquare },
    { label: "X", href: "https://x.com", icon: AtSign },
    { label: "YouTube", href: "https://youtube.com", icon: CirclePlay },
];

const shopLinks = [
    { label: "Men", href: "/products?gender=Men" },
    { label: "Women", href: "/products?gender=Women" },
    { label: "Unisex", href: "/products?gender=Unisex" },
    { label: "Perfumes", href: "/products?category=Perfume" },
    { label: "Face Wash", href: "/products?category=Face%20Wash" },
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
    const pathname = usePathname();
    const { roles } = useAuth();

    if (pathname.startsWith("/vendor") || roles.includes("Vendor")) {
        return null;
    }

    return (
        <footer className="border-t border-[#d8c8ad] bg-[var(--luxury-ink)] text-[var(--luxury-paper)]">
            <div className="mx-auto max-w-[1800px] px-4 py-12 sm:px-6 md:px-10 lg:py-16">
                <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
                    <section>
                        <Link
                            href="/"
                            className="-my-2.5 py-2.5 text-2xl font-semibold uppercase tracking-[0.18em] [font-family:var(--font-serif)] transition-colors duration-300 hover:text-[var(--luxury-gold)] sm:text-3xl sm:tracking-[0.34em]"
                        >
                            Fragrance
                        </Link>

                        <p className="mt-5 max-w-md text-sm leading-7 text-white/68">
                            A polished catalogue for private house fragrance, skincare, and ritual objects designed for daily discovery.
                        </p>

                        <div className="mt-8 h-px w-28 bg-[var(--luxury-gold)]" />

                        <div className="mt-6 flex gap-4">
                            {socialLinks.map(({ label, href, icon: Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="inline-flex -m-3 p-3 items-center justify-center text-white/58 transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--luxury-gold)]"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
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

                <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.12em] text-white/48 sm:tracking-[0.22em] md:flex-row md:items-center md:justify-between">
                    <p>Copyright {new Date().getFullYear()} Fragrance Commerce</p>
                    <p className="text-white/58">
                        The private house collection &mdash; fragrance, skincare
                        &amp; ritual
                    </p>
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

            <nav aria-label={title} className="mt-5 flex flex-col gap-3 text-sm text-white/68">
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
            className="-my-2.5 py-2.5 transition hover:translate-x-1 hover:text-[var(--luxury-gold)]"
        >
            {children}
        </Link>
    );
}
