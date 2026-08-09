import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Your Cart",
    description:
        "Review the fragrance and beauty essentials in your Fragrance Commerce shopping bag before checkout.",
    path: "/cart",
    noindex: true,
});

export default function CartLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
