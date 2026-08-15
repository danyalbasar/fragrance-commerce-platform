import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Verify Your Email",
    description:
        "Verify your email address to activate your Fragrance Commerce account and start shopping.",
    path: "/verify-email",
    noindex: true,
});

export default function VerifyEmailLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
