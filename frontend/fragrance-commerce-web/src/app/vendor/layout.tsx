import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";
import VendorRoute from "@/components/common/VendorRoute";
import VendorShell from "@/components/vendor/VendorShell";

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
    return (
        <VendorRoute>
            <VendorShell>{children}</VendorShell>
        </VendorRoute>
    );
}
