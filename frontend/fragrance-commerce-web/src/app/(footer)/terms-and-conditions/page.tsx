import type { Metadata } from "next";
import InfoPage from "@/components/common/InfoPage";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Terms and Conditions",
    description:
        "These terms outline the basic rules for browsing, purchasing, and using the Fragrance Commerce storefront.",
    path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
    return (
        <InfoPage
            eyebrow="Terms"
            title="Terms and conditions"
            intro="These terms outline the basic rules for browsing, purchasing, and using the Fragrance Commerce storefront."
            sections={[
                {
                    title: "Use of Website",
                    body: "Customers agree to use the website lawfully, provide accurate account and delivery information, and avoid activity that disrupts the store or its services.",
                },
                {
                    title: "Product Information",
                    body: "Product details, prices, images, availability, and offers may be updated as the catalogue changes. We aim to keep listings accurate and clear.",
                },
                {
                    title: "Orders and Payments",
                    body: "Orders are confirmed after successful checkout and payment validation. We may contact customers if information is incomplete or verification is required.",
                },
                {
                    title: "Changes to Terms",
                    body: "These terms may be revised as store operations, products, services, or legal requirements change.",
                },
            ]}
            contactCta
        />
    );
}
