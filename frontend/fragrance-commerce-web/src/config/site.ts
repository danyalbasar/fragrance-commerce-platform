import type { Metadata } from "next";

export const siteConfig = {
    name: "Fragrance Commerce",
    title: "Fragrance Commerce | Luxury Fragrances, Attars & Skincare",
    description:
        "Fragrance Commerce is a private fragrance house for luxury perfumes, attars, custom blends, cleansers, creams and nail care. Explore expressive scents and quiet skincare staged for discovery.",
    keywords: [
        "luxury fragrance",
        "perfume",
        "attar",
        "unisex perfume",
        "niche fragrance house",
        "custom perfume",
        "luxury skincare",
        "face wash",
        "fairness cream",
        "nail care",
        "fragrance for men",
        "fragrance for women",
        "private house labels",
        "fragrance india",
    ],
    url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
        /\/+$/,
        ""
    ),
    locale: "en_IN",
    ogImage: "/home/home-hero.jpg",
    twitterHandle: "@fragrancecommerce",
};

interface BuildMetadataOptions {
    title: string;
    description: string;
    path: string;
    keywords?: string[];
    noindex?: boolean;
    image?: string;
}

function toAbsoluteImage(image?: string): string {
    if (!image) return `${siteConfig.url}${siteConfig.ogImage}`;
    if (/^https?:\/\//.test(image)) return image;
    return `${siteConfig.url}${image}`;
}

export function buildMetadata({
    title,
    description,
    path,
    keywords,
    noindex = false,
    image,
}: BuildMetadataOptions): Metadata {
    const ogImage = toAbsoluteImage(image);

    return {
        title,
        description,
        keywords,
        alternates: { canonical: path },
        openGraph: {
            type: "website",
            url: path,
            siteName: siteConfig.name,
            title,
            description,
            locale: siteConfig.locale,
            images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            site: siteConfig.twitterHandle,
            title,
            description,
            images: [ogImage],
        },
        robots: noindex
            ? { index: false, follow: false }
            : {
                  index: true,
                  follow: true,
                  googleBot: {
                      index: true,
                      follow: true,
                      "max-image-preview": "large",
                      "max-snippet": -1,
                      "max-video-preview": -1,
                  },
              },
    };
}
