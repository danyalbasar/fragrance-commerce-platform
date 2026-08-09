import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Checkout",
    description:
        "Complete your Fragrance Commerce order with secure shipping and payment details.",
    path: "/checkout",
    noindex: true,
});

export default function CheckoutLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
