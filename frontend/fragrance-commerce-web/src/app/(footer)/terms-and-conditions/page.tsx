import type { Metadata } from "next";
import CmsInfoPage from "@/components/common/CmsInfoPage";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Terms and Conditions",
    description:
        "These terms outline the basic rules for browsing, purchasing, and using the Fragrance Commerce storefront.",
    path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
    return <CmsInfoPage prefix="terms" contactCta />;
}
