import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Create Account",
    description:
        "Create your Fragrance Commerce account to shop luxury perfumes, attars and skincare, track orders and save your favourites.",
    path: "/signup",
    noindex: true,
});

export default function SignupLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
