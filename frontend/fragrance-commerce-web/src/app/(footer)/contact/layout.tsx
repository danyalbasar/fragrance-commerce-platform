import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Contact Us",
    description:
        "Reach out to the Fragrance Commerce house for help with orders, product selection, account questions or delivery support.",
    path: "/contact",
});

export default function ContactLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
