import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";
import VendorRoute from "@/components/common/VendorRoute";
import VendorSidebar from "@/components/vendor/VendorSidebar";

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
            <div className="flex min-h-screen bg-[var(--luxury-ivory)] text-[var(--luxury-ink)]">
                <VendorSidebar />
                <main className="flex-1 min-w-0 overflow-x-hidden">
                    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                        {children}
                    </div>
                </main>
            </div>
        </VendorRoute>
    );
}
