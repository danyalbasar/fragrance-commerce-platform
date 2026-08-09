import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { productService } from "@/services/productService";

const staticPages: Array<{
    path: string;
    priority: number;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]>["changeFrequency"];
}> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/products", priority: 0.9, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
    { path: "/faq", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/return-policy", priority: 0.2, changeFrequency: "yearly" },
    {
        path: "/terms-and-conditions",
        priority: 0.2,
        changeFrequency: "yearly",
    },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const routes: MetadataRoute.Sitemap = staticPages.map(({ path, priority, changeFrequency }) => ({
        url: new URL(path, siteConfig.url).toString(),
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    let productRoutes: MetadataRoute.Sitemap = [];

    try {
        const products = await productService.getAll();

        productRoutes = products.map((product) => ({
            url: new URL(`/products/${product.id}`, siteConfig.url).toString(),
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));
    } catch {
        productRoutes = [];
    }

    return [...routes, ...productRoutes];
}
