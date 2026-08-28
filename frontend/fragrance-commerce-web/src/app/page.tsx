"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";
import VendorHomeRedirect from "@/components/vendor/VendorHomeRedirect";
import ProductCard from "@/components/products/ProductCard";
import QuickAddBar from "@/components/products/QuickAddBar";
import { productService } from "@/services/productService";
import { getPublicSettings } from "@/services/siteSettingsService";
import type { Product } from "@/types/product";

const FeaturedProductScroller = dynamic(
  () => import("@/components/home/FeaturedProductScroller"),
  {
    loading: () => <FeaturedScrollerFallback />,
  }
);

type FeaturedProduct = {
  brand: string;
  name: string;
  category: string;
  price: string;
  image: string;
  href: string;
};

const defaultFeaturedProducts: FeaturedProduct[] = [
  {
    brand: "Aurelian Atelier",
    name: "Velvet Saffron",
    category: "Unisex Eau de Parfum",
    price: "₹5,799",
    image: "https://res.cloudinary.com/dyvti3sda/image/upload/v1782569576/fragrance-commerce/demo-products/aurelian-velvet-saffron.png",
    href: "/products?search=Velvet%20Saffron",
  },
  {
    brand: "Nocturne Vale",
    name: "Cedar Smoke",
    category: "Men's Parfum",
    price: "₹3,999",
    image: "https://res.cloudinary.com/dyvti3sda/image/upload/v1782569614/fragrance-commerce/demo-products/nocturne-cedar-smoke.png",
    href: "/products?search=Cedar%20Smoke",
  },
  {
    brand: "Mira Solace",
    name: "Pearl Veil",
    category: "Bright Cream",
    price: "₹1,099",
    image: "https://res.cloudinary.com/dyvti3sda/image/upload/v1782569663/fragrance-commerce/demo-products/mira-pearl-veil-cream.png",
    href: "/products?search=Pearl%20Veil",
  },
];

const defaultHouseBrands = [
  "Aurelian Atelier",
  "Nocturne Vale",
  "Mira Solace",
  "Vellum & Dew",
];

const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>(defaultHouseBrands);
  const [loaded, setLoaded] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  const [hero, setHero] = useState({
    title: "Scent, skincare, and ritual objects for a polished life.",
    subtitle:
      "Explore private house labels, expressive perfumes, quiet skincare, and daily essentials staged for discovery.",
    ctaText: "Shop Collection",
    ctaLink: "/products",
    secondaryCtaText: "Discover Scents",
    secondaryCtaLink: "/products?category=Perfume",
  });

  const [panels, setPanels] = useState([
    {
      image: "/home/home-fragrance.jpg",
      eyebrow: "Fragrance Wardrobe",
      title: "Perfumes, attars, and customised blends",
      text: "From saffroned warmth to smoky cedar, build a scent wardrobe for workdays, evenings, and close rituals.",
      link: "/products?category=Perfume",
      cta: "Shop Fragrance",
    },
    {
      image: "/home/home-skincare.jpg",
      eyebrow: "Skin Rituals",
      title: "Cleansers, creams, and polished care",
      text: "Soft-focus skincare essentials designed to sit beautifully beside your fragrance collection.",
      link: "/products?category=Face%20Wash",
      cta: "Shop Skincare",
    },
  ]);

  const [houseBrands, setHouseBrands] = useState<string[]>(defaultHouseBrands);

  const [valueBarItems, setValueBarItems] = useState<string[]>([
    "Cloud-like skincare",
    "Amber-rich attars",
    "Genderless signatures",
    "Private house labels",
  ]);

  const [quoteText, setQuoteText] = useState(
    "A fragrance should be worn like a signature \u2014 quietly, deliberately, and entirely your own."
  );
  const [quoteAttribution, setQuoteAttribution] = useState("The House Motto");

  const [featured, setFeatured] = useState<FeaturedProduct[]>(defaultFeaturedProducts);
  const [featuredTitle, setFeaturedTitle] = useState("Objects of desire.");
  const [featuredSubtitle, setFeaturedSubtitle] = useState(
    "A focused selection from the private labels now available in the store."
  );

  const [housePromises, setHousePromises] = useState([
    { title: "Curated Discovery", text: "Shop by gender, category, or house without losing the boutique feel." },
    { title: "Quiet Product Detail", text: "Large visuals, variant choices, wishlist controls, and cart previews keep the flow focused." },
    { title: "Ritual Ready", text: "Fragrance and skincare now share one polished visual language across the store." },
  ]);

  const [newsletterTitle, setNewsletterTitle] = useState("Letters from the house.");
  const [newsletterSubtitle, setNewsletterSubtitle] = useState(
    "New releases, private previews, and quiet notes on the collection \u2014 sent only when there is something worth saying."
  );

  const [ctaTitle, setCtaTitle] = useState("Find the next signature.");
  const [ctaSubtitle, setCtaSubtitle] = useState(
    "Browse perfumes, attars, customised blends, face washes, creams, and nail care from the new house catalogue."
  );
  const [ctaButtonText, setCtaButtonText] = useState("Shop the Archive");
  const [ctaButtonLink, setCtaButtonLink] = useState("/products");

  const [heroEyebrow, setHeroEyebrow] = useState("Private Fragrance House");
  const [categoriesEyebrow, setCategoriesEyebrow] = useState("Enter the House");
  const [categoriesTitle, setCategoriesTitle] = useState("Choose your ritual.");
  const [categoriesLinkText, setCategoriesLinkText] = useState("View all products");
  const [featuredEyebrow, setFeaturedEyebrow] = useState("Featured Collection");
  const [bestSellersEyebrow, setBestSellersEyebrow] = useState("Most Loved");
  const [bestSellersTitle, setBestSellersTitle] = useState("The best sellers.");
  const [bestSellersLinkText, setBestSellersLinkText] = useState("View all");
  const [newArrivalsEyebrow, setNewArrivalsEyebrow] = useState("Just Arrived");
  const [newArrivalsTitle, setNewArrivalsTitle] = useState("New arrivals.");
  const [newArrivalsLinkText, setNewArrivalsLinkText] = useState("Explore new");
  const [brandsEyebrow, setBrandsEyebrow] = useState("The Houses & Partners");
  const [maisonNotesEyebrow, setMaisonNotesEyebrow] = useState("Maison Notes");
  const [newsletterEyebrow, setNewsletterEyebrow] = useState("The List");
  const [ctaEyebrow, setCtaEyebrow] = useState("Begin Again");

  useEffect(() => {
    getPublicSettings().then((settings) => {
      setHero({
        title: settings.hero_title || "Scent, skincare, and ritual objects for a polished life.",
        subtitle: settings.hero_subtitle || "Explore private house labels, expressive perfumes, quiet skincare, and daily essentials staged for discovery.",
        ctaText: settings.hero_cta_text || "Shop Collection",
        ctaLink: settings.hero_cta_link || "/products",
        secondaryCtaText: settings.hero_secondary_cta_text || "Discover Scents",
        secondaryCtaLink: settings.hero_secondary_cta_link || "/products?category=Perfume",
      });

      setPanels([
        {
          image: settings.category_panel_1_image || "/home/home-fragrance.jpg",
          eyebrow: settings.category_panel_1_eyebrow || "Fragrance Wardrobe",
          title: settings.category_panel_1_title || "Perfumes, attars, and customised blends",
          text: settings.category_panel_1_text || "From saffroned warmth to smoky cedar, build a scent wardrobe for workdays, evenings, and close rituals.",
          link: settings.category_panel_1_link || "/products?category=Perfume",
          cta: settings.category_panel_1_cta || "Shop Fragrance",
        },
        {
          image: settings.category_panel_2_image || "/home/home-skincare.jpg",
          eyebrow: settings.category_panel_2_eyebrow || "Skin Rituals",
          title: settings.category_panel_2_title || "Cleansers, creams, and polished care",
          text: settings.category_panel_2_text || "Soft-focus skincare essentials designed to sit beautifully beside your fragrance collection.",
          link: settings.category_panel_2_link || "/products?category=Face%20Wash",
          cta: settings.category_panel_2_cta || "Shop Skincare",
        },
      ]);

      try {
        setHouseBrands(JSON.parse(settings.house_brands || "[]"));
      } catch {
        /* keep default */
      }

      try {
        const parsed = JSON.parse(settings.value_bar_items || "[]");
        if (Array.isArray(parsed) && parsed.length > 0) setValueBarItems(parsed);
      } catch { /* keep default */ }

      if (settings.quote_text) setQuoteText(settings.quote_text);
      if (settings.quote_attribution) setQuoteAttribution(settings.quote_attribution);

      if (settings.featured_section_title) setFeaturedTitle(settings.featured_section_title);
      if (settings.featured_section_subtitle) setFeaturedSubtitle(settings.featured_section_subtitle);

      try {
        const parsed = JSON.parse(settings.featured_product_ids || "[]");
        if (Array.isArray(parsed) && parsed.length > 0) {
          Promise.all(parsed.map((id: string) => productService.getById(id)))
            .then((products) => {
              const mapped: FeaturedProduct[] = products.map((p) => {
                const variant = p.variants[0];
                return {
                  brand: p.brandName || "",
                  name: p.name,
                  category: variant?.variantName || p.categoryName || "",
                  price: variant?.sellingPrice ? `\u20B9${variant.sellingPrice.toLocaleString("en-IN")}` : "",
                  image: p.images[0]?.imageUrl || "",
                  href: `/products/${p.id}`,
                };
              }).filter((fp) => fp.image);
              if (mapped.length > 0) setFeatured(mapped);
            })
            .catch(() => { /* keep default */ });
        } else {
          productService.getAll().then((all) => {
            const inStock = all.filter(
              (product) =>
                product.images.length > 0 &&
                product.variants.some((variant) => variant.stockQuantity > 0)
            );
            const autoPicked = houseBrands
              ? [...houseBrands.map((brand) => inStock.find((product) => product.brandName === brand))]
                  .filter((product): product is typeof all[0] => Boolean(product))
              : [];
            const featuredSource = autoPicked.length > 0 ? autoPicked : inStock;
            const chosen = featuredSource.slice(0, 3);
            if (chosen.length > 0) {
              const mapped: FeaturedProduct[] = chosen.map((p) => {
                const variant = p.variants[0];
                return {
                  brand: p.brandName || "",
                  name: p.name,
                  category: variant?.variantName || p.categoryName || "",
                  price: variant?.sellingPrice ? `\u20B9${variant.sellingPrice.toLocaleString("en-IN")}` : "",
                  image: p.images[0]?.imageUrl || "",
                  href: `/products/${p.id}`,
                };
              });
              setFeatured(mapped);
            }
          }).catch(() => { /* keep default */ });
        }
      } catch { /* keep default */ }

      try {
        const parsed = JSON.parse(settings.house_promises || "[]");
        if (Array.isArray(parsed) && parsed.length > 0) setHousePromises(parsed);
      } catch { /* keep default */ }

      if (settings.newsletter_title) setNewsletterTitle(settings.newsletter_title);
      if (settings.newsletter_subtitle) setNewsletterSubtitle(settings.newsletter_subtitle);

      if (settings.cta_title) setCtaTitle(settings.cta_title);
      if (settings.cta_subtitle) setCtaSubtitle(settings.cta_subtitle);
      if (settings.cta_button_text) setCtaButtonText(settings.cta_button_text);
      if (settings.cta_button_link) setCtaButtonLink(settings.cta_button_link);

      if (settings.hero_eyebrow) setHeroEyebrow(settings.hero_eyebrow);
      if (settings.categories_eyebrow) setCategoriesEyebrow(settings.categories_eyebrow);
      if (settings.categories_title) setCategoriesTitle(settings.categories_title);
      if (settings.categories_link_text) setCategoriesLinkText(settings.categories_link_text);
      if (settings.featured_eyebrow) setFeaturedEyebrow(settings.featured_eyebrow);
      if (settings.best_sellers_eyebrow) setBestSellersEyebrow(settings.best_sellers_eyebrow);
      if (settings.best_sellers_title) setBestSellersTitle(settings.best_sellers_title);
      if (settings.best_sellers_link_text) setBestSellersLinkText(settings.best_sellers_link_text);
      if (settings.new_arrivals_eyebrow) setNewArrivalsEyebrow(settings.new_arrivals_eyebrow);
      if (settings.new_arrivals_title) setNewArrivalsTitle(settings.new_arrivals_title);
      if (settings.new_arrivals_link_text) setNewArrivalsLinkText(settings.new_arrivals_link_text);
      if (settings.brands_eyebrow) setBrandsEyebrow(settings.brands_eyebrow);
      if (settings.maison_notes_eyebrow) setMaisonNotesEyebrow(settings.maison_notes_eyebrow);
      if (settings.newsletter_eyebrow) setNewsletterEyebrow(settings.newsletter_eyebrow);
      if (settings.cta_eyebrow) setCtaEyebrow(settings.cta_eyebrow);
    }).catch(() => { /* keep defaults */ });
  }, []);

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      try {
        const [all, recent] = await Promise.all([
          productService.getAll(),
          productService.search({
            sortBy: "createdAt",
            sortDirection: "desc",
            inStockOnly: true,
            pageSize: 12,
          }),
        ]);

        const inStock = all.filter((product) =>
          product.variants.some((variant) => variant.stockQuantity > 0)
        );

        const best = houseBrands
          .map((brand) =>
            inStock.find((product) => product.brandName === brand)
          )
          .filter((product): product is Product => Boolean(product))
          .slice(0, 4);

        const bestIds = new Set(best.map((product) => product.id));

        const arrivals = [
          ...recent.items.filter((product) => !bestIds.has(product.id)),
          ...inStock.filter((product) => !bestIds.has(product.id)),
        ]
          .filter(
            (product) =>
              product.images.length > 0 &&
              product.variants.some((variant) => variant.stockQuantity > 0)
          )
          .reduce<Product[]>((acc, product) => {
            if (acc.some((item) => item.id === product.id)) return acc;
            return [...acc, product];
          }, [])
          .slice(0, 4);

        const availableBrands = Array.from(
          new Set(all.map((product) => product.brandName).filter(Boolean))
        );
        const orderedBrands = [
          ...houseBrands.filter((brand) => availableBrands.includes(brand)),
          ...availableBrands.filter((brand) => !houseBrands.includes(brand)),
        ].slice(0, 8);

        if (!active) return;
        setBestSellers(best);
        setNewArrivals(arrivals);
        setBrands(orderedBrands);
      } catch {
        if (!active) return;
      } finally {
        if (active) setLoaded(true);
      }
    }

    loadHomeData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="bg-[var(--luxury-ivory)] text-[var(--luxury-ink)]">
      <VendorHomeRedirect />

      <section className="relative isolate min-h-[calc(100svh-65px)] overflow-hidden md:min-h-[calc(100vh-73px)]">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/home/home-hero.jpg"
            alt="Luxury fragrance and skincare collection arranged on a warm studio set"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,18,13,0.84)_0%,rgba(22,18,13,0.56)_42%,rgba(22,18,13,0.06)_100%)]" />

        <div className="relative flex min-h-[calc(100svh-65px)] w-full items-center px-4 py-12 sm:px-6 md:min-h-[calc(100vh-73px)] md:px-8 md:py-16 xl:px-12">
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
            className="max-w-2xl text-white"
          >
            <motion.p
              variants={heroItem}
              className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxury-gold)] sm:tracking-[0.42em]"
            >
              {heroEyebrow}
            </motion.p>
            <motion.h1
              variants={heroItem}
              className="mt-5 text-4xl font-normal leading-[1.02] [font-family:var(--font-serif)] sm:text-5xl md:text-7xl"
            >
              {hero.title}
            </motion.h1>
            <motion.p
              variants={heroItem}
              className="mt-6 max-w-xl text-base leading-8 text-white/78 md:text-lg"
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              variants={heroItem}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href={hero.ctaLink}
                className="inline-flex justify-center rounded-full bg-[var(--luxury-gold)] px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-ink)] transition hover:bg-[#d1ab67] sm:px-8 sm:tracking-[0.18em]"
              >
                {hero.ctaText}
              </Link>
              <Link
                href={hero.secondaryCtaLink}
                className="inline-flex justify-center rounded-full border border-white/45 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] sm:px-8 sm:tracking-[0.18em]"
              >
                {hero.secondaryCtaText}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#d8c8ad] bg-[rgba(255,250,242,0.72)] px-4 py-5 backdrop-blur-xl sm:px-6">
        <Reveal className="mx-auto grid max-w-[1800px] gap-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)] sm:tracking-[0.28em] md:grid-cols-4">
          {valueBarItems.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </Reveal>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-[1800px]">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                {categoriesEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                {categoriesTitle}
              </h2>
            </div>
            <Link
              href="/products"
              className="-my-2.5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)]"
            >
              {categoriesLinkText}
            </Link>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <CategoryPanel
                image={panels[0].image}
                eyebrow={panels[0].eyebrow}
                title={panels[0].title}
                text={panels[0].text}
                href={panels[0].link}
                cta={panels[0].cta}
              />
            </Reveal>
            <Reveal delay={0.12}>
              <CategoryPanel
                image={panels[1].image}
                eyebrow={panels[1].eyebrow}
                title={panels[1].title}
                text={panels[1].text}
                href={panels[1].link}
                cta={panels[1].cta}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#efe3d0] px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-[1800px]">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                {featuredEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                {featuredTitle}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--luxury-muted)]">
              {featuredSubtitle}
            </p>
          </Reveal>

          <Reveal>
            <FeaturedProductScroller products={featured} />
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-[1800px]">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                {bestSellersEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                {bestSellersTitle}
              </h2>
            </div>
            <Link
              href="/products"
              className="-my-2.5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)]"
            >
              {bestSellersLinkText}
            </Link>
          </Reveal>

          <Reveal>
            <ProductGrid products={bestSellers} loading={!loaded} onQuickAdd={setQuickAddProduct} />
          </Reveal>
        </div>
      </section>

      <section className="bg-[#efe3d0] px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-[1800px]">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                {newArrivalsEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                {newArrivalsTitle}
              </h2>
            </div>
            <Link
              href="/products"
              className="-my-2.5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)]"
            >
              {newArrivalsLinkText}
            </Link>
          </Reveal>

          <Reveal>
            <ProductGrid products={newArrivals} loading={!loaded} onQuickAdd={setQuickAddProduct} />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-[#d8c8ad] bg-[rgba(255,250,242,0.72)] px-4 py-12 backdrop-blur-xl sm:px-6 md:py-16">
        <Reveal className="mx-auto max-w-[1800px]">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-muted)]">
            {brandsEyebrow}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`/products?search=${encodeURIComponent(brand)}`}
                className="-my-2.5 py-2.5 text-center text-base font-normal uppercase tracking-[0.16em] text-[var(--luxury-muted)] transition-colors duration-200 hover:text-[var(--luxury-gold)] [font-family:var(--font-serif)] sm:text-lg"
              >
                {brand}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-[var(--luxury-ink)] px-4 py-20 text-[var(--luxury-paper)] sm:px-6 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(182,138,66,0.14)_0%,rgba(22,18,13,0)_68%)]" />
        <Reveal className="relative mx-auto max-w-4xl text-center">
          <span
            aria-hidden
            className="block text-7xl leading-[0.6] text-[var(--luxury-gold)] [font-family:var(--font-serif)]"
          >
            &ldquo;
          </span>
          <blockquote className="mt-4 text-2xl font-normal leading-relaxed [font-family:var(--font-serif)] sm:text-3xl md:text-4xl">
            {quoteText}
          </blockquote>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
            {quoteAttribution}
          </p>
        </Reveal>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto grid max-w-[1800px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal className="relative aspect-[3/2] overflow-hidden bg-[#efe0ca]">
            <Image
              src="/home/home-ritual.jpg"
              alt="Fragrance and skincare ritual objects on a refined counter"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
              {maisonNotesEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-normal leading-tight [font-family:var(--font-serif)] sm:text-4xl md:text-6xl">
              A storefront for house labels that still feels tactile.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
              The collection is staged like a real luxury catalogue: restrained
              navigation, visual hierarchy, product-led imagery, and clear
              paths into fragrance or skincare.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {houseBrands.map((house) => (
                <Link
                  key={house}
                  href={`/products?search=${encodeURIComponent(house)}`}
                  className="border-b border-[#d8c8ad] py-4 text-lg [font-family:var(--font-serif)] transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
                >
                  {house}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto grid max-w-[1800px] gap-8 md:grid-cols-3">
          {housePromises.map((promise, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <HousePromise
                title={promise.title}
                text={promise.text}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#efe3d0] px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
            {newsletterEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
            {newsletterTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--luxury-muted)]">
            {newsletterSubtitle}
          </p>

          <NewsletterSection />
        </Reveal>
      </section>

      <section className="px-4 py-14 text-center sm:px-6 md:px-8 md:py-24 xl:px-12">
        <Reveal className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
            {ctaEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-6xl">
            {ctaTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--luxury-muted)]">
            {ctaSubtitle}
          </p>
          <Link
            href={ctaButtonLink}
            className="mt-8 inline-flex rounded-full bg-[var(--luxury-ink)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)]"
          >
            {ctaButtonText}
          </Link>
        </Reveal>
      </section>

      <QuickAddBar product={quickAddProduct} onClose={() => setQuickAddProduct(null)} />
    </main>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProductGrid({
  products,
  loading,
  onQuickAdd,
}: {
  products: Product[];
  loading: boolean;
  onQuickAdd?: (product: Product) => void;
}) {
  if (loading) {
    return (
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[1/1.08] min-w-[70%] max-w-[70%] basis-[70%] shrink-0 snap-start animate-pulse rounded-[var(--luxury-radius)] bg-[#efe3d0] md:min-w-0 md:max-w-none md:basis-auto md:shrink"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
        New pieces are being added to this edit.
      </p>
    );
  }

  return (
    <ProductGridScroller products={products} onQuickAdd={onQuickAdd} />
  );
}

function ProductGridScroller({ products, onQuickAdd }: { products: Product[]; onQuickAdd?: (product: Product) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function scrollProducts(direction: "left" | "right") {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    scroller.scrollBy({
      left:
        direction === "left"
          ? -scroller.clientWidth * 0.85
          : scroller.clientWidth * 0.85,
      behavior: "smooth",
    });
  }

  const updateScrollControls = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    const firstCard = scroller.firstElementChild as HTMLElement | null;
    const lastCard = scroller.lastElementChild as HTMLElement | null;
    const scrollerBounds = scroller.getBoundingClientRect();
    const firstCardBounds = firstCard?.getBoundingClientRect();
    const lastCardBounds = lastCard?.getBoundingClientRect();

    setCanScrollLeft(
      firstCardBounds ? firstCardBounds.left < scrollerBounds.left - 2 : false
    );
    setCanScrollRight(
      lastCardBounds ? lastCardBounds.right > scrollerBounds.right + 2 : false
    );
  }, []);

  useEffect(() => {
    updateScrollControls();

    const scroller = scrollerRef.current;

    if (!scroller) return;

    scroller.addEventListener("scroll", updateScrollControls);
    window.addEventListener("resize", updateScrollControls);

    return () => {
      scroller.removeEventListener("scroll", updateScrollControls);
      window.removeEventListener("resize", updateScrollControls);
    };
  }, [updateScrollControls]);

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollProducts("left")}
          className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-[0_14px_30px_rgba(22,18,13,0.18)] transition-all duration-200 hover:scale-105 hover:text-[var(--luxury-gold)] active:scale-90 md:hidden"
          aria-label="Scroll products left"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <div
        ref={scrollerRef}
        onScroll={updateScrollControls}
        className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[70%] max-w-[70%] basis-[70%] shrink-0 snap-start md:min-w-0 md:max-w-none md:basis-auto md:shrink"
          >
            <ProductCard product={product} compactMobile onQuickAdd={onQuickAdd} />
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollProducts("right")}
          className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-[0_14px_30px_rgba(22,18,13,0.18)] transition-all duration-200 hover:scale-105 hover:text-[var(--luxury-gold)] active:scale-90 md:hidden"
          aria-label="Scroll products right"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}

function CategoryPanel({
  image,
  eyebrow,
  title,
  text,
  href,
  cta,
}: {
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative min-h-[420px] overflow-hidden sm:min-h-[560px]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,18,13,0.1)_0%,rgba(22,18,13,0.48)_48%,rgba(22,18,13,0.86)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8 md:p-10">
          <p className="inline-flex bg-[rgba(22,18,13,0.58)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f1c778] shadow-[0_12px_30px_rgba(22,18,13,0.28)] backdrop-blur-sm sm:tracking-[0.32em]">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-3xl font-normal leading-tight [font-family:var(--font-serif)] sm:text-4xl">
            {title}
          </h3>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/76">
            {text}
          </p>
          <span className="mt-6 inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold)]">
            {cta}
          </span>
        </div>
      </div>
    </Link>
  );
}

function HousePromise({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-strong)]">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
        {text}
      </p>
    </div>
  );
}

function FeaturedScrollerFallback() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden border border-[#d8c8ad] bg-[var(--luxury-paper)]"
        >
          <div className="aspect-[1/1.18] animate-pulse bg-[#ead9c0] md:h-[390px] md:aspect-auto" />
          <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-[#e5d9c4]" />
            <div className="h-6 w-40 animate-pulse rounded bg-[#e5d9c4]" />
            <div className="h-4 w-28 animate-pulse rounded bg-[#e5d9c4]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
  }

  return (
    <>
      <form
        onSubmit={handleSubscribe}
        className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="Your email address"
          aria-label="Email address"
          className="min-h-12 flex-1 rounded-full border border-[#d8c8ad] bg-[var(--luxury-input)] px-5 text-sm text-[var(--luxury-ink)] placeholder:text-[var(--luxury-muted)] focus:border-[var(--luxury-gold)] focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--luxury-ink)] px-7 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-paper)] transition-all duration-200 hover:bg-[var(--luxury-moss)] active:scale-[0.98]"
        >
          <Mail size={16} />
          Subscribe
        </button>
      </form>

      {subscribed && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-sm font-medium text-[var(--luxury-moss)]"
        >
          Welcome to the house. Look for our first letter soon.
        </motion.p>
      )}
    </>
  );
}
