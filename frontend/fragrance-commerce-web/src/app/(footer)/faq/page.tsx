import InfoPage from "@/components/common/InfoPage";

export default function FaqPage() {
    return (
        <InfoPage
            eyebrow="Help"
            title="Frequently asked questions"
            intro="Quick answers for shopping, ordering, wishlist, delivery, and account questions."
            sections={[
                {
                    title: "How do I choose a product?",
                    body: "Use category, gender, brand, and price filters on the products page. Product detail pages include sizes, descriptions, reviews, and similar recommendations.",
                },
                {
                    title: "Can I save products?",
                    body: "Yes. Sign in and use the heart icon to save products to your wishlist, then move them to cart when you are ready.",
                },
                {
                    title: "How do I track orders?",
                    body: "After signing in, open the orders page from your account or footer link to view your purchase archive and order status.",
                },
                {
                    title: "What if my product arrives damaged?",
                    body: "Contact support with your order number and clear photos of the package and product so the issue can be reviewed.",
                },
            ]}
            contactCta
        />
    );
}
