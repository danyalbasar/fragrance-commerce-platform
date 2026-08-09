import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "My Wishlist",
    description:
        "Your saved fragrances and beauty essentials at Fragrance Commerce, ready to revisit.",
    path: "/wishlist",
    noindex: true,
});

export default function WishlistLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
