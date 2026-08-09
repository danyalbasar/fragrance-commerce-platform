import type { Metadata } from "next";
import InfoPage from "@/components/common/InfoPage";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Return Policy",
    description:
        "Returns and exchanges at Fragrance Commerce are handled carefully to protect product quality, hygiene, and customer satisfaction.",
    path: "/return-policy",
});

export default function ReturnPolicyPage() {
    return (
        <InfoPage
            eyebrow="Returns"
            title="Return policy"
            intro="Returns and exchanges are handled carefully to protect product quality, hygiene, and customer satisfaction."
            sections={[
                {
                    title: "Return Window",
                    body: "Eligible return requests should be raised soon after delivery. Include the order number, product name, reason, and clear photos when relevant.",
                },
                {
                    title: "Condition",
                    body: "Products should be unused, unopened, and returned with original packaging unless the item arrived damaged, incorrect, or defective.",
                },
                {
                    title: "Non-Returnable Items",
                    body: "Opened fragrance, skincare, cosmetic, or hygiene-sensitive products may not qualify for return unless there is a verified issue with the order.",
                },
                {
                    title: "Refunds and Exchanges",
                    body: "Approved returns may be resolved through replacement, exchange, store credit, or refund depending on the order issue and product condition.",
                },
            ]}
            contactCta
        />
    );
}
