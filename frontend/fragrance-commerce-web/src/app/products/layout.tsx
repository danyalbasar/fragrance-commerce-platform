import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Shop Products",
    description:
        "Browse the curated Fragrance Commerce collection of luxury perfumes, attars, custom blends, cleansers, creams and nail care. Filter by gender, category, brand and price.",
    path: "/products",
    keywords: [
        "buy perfume online",
        "luxury fragrance collection",
        "attar india",
        "custom perfume",
        "perfume for men",
        "perfume for women",
        "unisex fragrance",
        "luxury skincare",
    ],
});

export default function ProductsLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
