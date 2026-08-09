import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Vendor Studio",
    description:
        "Manage products, orders and storefront operations in the Fragrance Commerce vendor studio.",
    path: "/vendor",
    noindex: true,
});

export default function VendorLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
