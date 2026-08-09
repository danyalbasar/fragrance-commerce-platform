import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Login",
    description:
        "Sign in to your Fragrance Commerce account to revisit your wishlist, orders and saved fragrance rituals.",
    path: "/login",
    noindex: true,
});

export default function LoginLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
