import type { Metadata } from "next";
import CmsInfoPage from "@/components/common/CmsInfoPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Frequently Asked Questions",
    description:
        "Quick answers for shopping, ordering, wishlist, delivery, and account questions at Fragrance Commerce.",
    path: "/faq",
    keywords: ["faq", "fragrance help", "perfume questions", "order help"],
});

export default function FaqPage() {
    return (
        <>
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: [],
                }}
            />
            <CmsInfoPage prefix="faq" contactCta sectionType="question" />
        </>
    );
}
