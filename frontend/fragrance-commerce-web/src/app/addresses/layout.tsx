import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Addresses",
    description:
        "Manage the shipping addresses saved to your Fragrance Commerce account.",
    path: "/addresses",
    noindex: true,
});

export default function AddressesLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
