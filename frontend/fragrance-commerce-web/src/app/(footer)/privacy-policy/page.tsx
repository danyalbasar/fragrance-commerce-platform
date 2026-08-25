import type { Metadata } from "next";
import CmsInfoPage from "@/components/common/CmsInfoPage";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Privacy Policy",
    description:
        "This policy explains how customer information is used to run the Fragrance Commerce storefront, process orders, and support account activity.",
    path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
    return <CmsInfoPage prefix="privacy" contactCta />;
}
