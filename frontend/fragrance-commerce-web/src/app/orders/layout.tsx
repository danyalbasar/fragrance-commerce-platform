import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "My Orders",
    description:
        "View your Fragrance Commerce purchase archive, order status and history.",
    path: "/orders",
    noindex: true,
});

export default function OrdersLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
