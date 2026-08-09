import type { Metadata } from "next";
import InfoPage from "@/components/common/InfoPage";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Privacy Policy",
    description:
        "This policy explains how customer information is used to run the Fragrance Commerce storefront, process orders, and support account activity.",
    path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
    return (
        <InfoPage
            eyebrow="Privacy"
            title="Privacy policy"
            intro="This policy explains how customer information is used to run the storefront, process orders, and support account activity."
            sections={[
                {
                    title: "Information We Collect",
                    body: "We may collect account details, contact information, delivery addresses, cart activity, wishlist activity, payment status, and order history.",
                },
                {
                    title: "How We Use It",
                    body: "Information is used to process orders, manage deliveries, provide support, improve the catalogue experience, prevent misuse, and maintain secure account access.",
                },
                {
                    title: "Data Sharing",
                    body: "Order and delivery details may be shared with service providers involved in payment, fulfilment, shipping, hosting, analytics, or customer support.",
                },
                {
                    title: "Your Choices",
                    body: "You can update account information, manage saved addresses, and contact support for reasonable requests about your stored customer data.",
                },
            ]}
            contactCta
        />
    );
}
