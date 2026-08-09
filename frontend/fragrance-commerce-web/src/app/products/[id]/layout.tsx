import type { Metadata } from "next";
import { buildMetadata, siteConfig } from "@/config/site";
import { productService } from "@/services/productService";

interface ProductLayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: ProductLayoutProps): Promise<Metadata> {
    const { id } = await params;

    try {
        const product = await productService.getById(id);

        const primaryImage =
            product.images.find((image) => image.isPrimary)?.imageUrl ||
            product.images[0]?.imageUrl ||
            product.variants.find((variant) => variant.images?.length)?.images?.[0]
                ?.imageUrl;

        const description =
            product.description ||
            `${product.brandName} — ${product.categoryName} for ${product.gender}. Explore the full Fragrance Commerce collection.`;

        return buildMetadata({
            title: product.name,
            description: description.slice(0, 160),
            path: `/products/${product.id}`,
            keywords: [
                product.name,
                product.brandName,
                product.categoryName,
                product.gender,
                "fragrance",
                ...siteConfig.keywords,
            ],
            image: primaryImage,
        });
    } catch {
        return buildMetadata({
            title: "Product",
            description: siteConfig.description,
            path: `/products/${id}`,
        });
    }
}

export default function ProductLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
