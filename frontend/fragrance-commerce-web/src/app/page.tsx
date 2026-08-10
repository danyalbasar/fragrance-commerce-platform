"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import VendorHomeRedirect from "@/components/vendor/VendorHomeRedirect";
import ProductCard from "@/components/products/ProductCard";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";

const FeaturedProductScroller = dynamic(
  () => import("@/components/home/FeaturedProductScroller"),
  {
    loading: () => <FeaturedScrollerFallback />,
  }
);

const featuredProducts = [
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

const houseBrands = [
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
  const [brands, setBrands] = useState<string[]>(houseBrands);
  const [loaded, setLoaded] = useState(false);

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
              Private Fragrance House
            </motion.p>
            <motion.h1
              variants={heroItem}
              className="mt-5 text-4xl font-normal leading-[1.02] [font-family:var(--font-serif)] sm:text-5xl md:text-7xl"
            >
              Scent, skincare, and ritual objects for a polished life.
            </motion.h1>
            <motion.p
              variants={heroItem}
              className="mt-6 max-w-xl text-base leading-8 text-white/78 md:text-lg"
            >
              Explore private house labels, expressive perfumes, quiet
              skincare, and daily essentials staged for discovery.
            </motion.p>

            <motion.div
              variants={heroItem}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/products"
                className="inline-flex justify-center rounded-full bg-[var(--luxury-gold)] px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-ink)] transition hover:bg-[#d1ab67] sm:px-8 sm:tracking-[0.18em]"
              >
                Shop Collection
              </Link>
              <Link
                href="/products?category=Perfume"
                className="inline-flex justify-center rounded-full border border-white/45 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] sm:px-8 sm:tracking-[0.18em]"
              >
                Discover Scents
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#d8c8ad] bg-[rgba(255,250,242,0.72)] px-4 py-5 backdrop-blur-xl sm:px-6">
        <Reveal className="mx-auto grid max-w-[1800px] gap-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)] sm:tracking-[0.28em] md:grid-cols-4">
          <span>Cloud-like skincare</span>
          <span>Amber-rich attars</span>
          <span>Genderless signatures</span>
          <span>Private house labels</span>
        </Reveal>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-[1800px]">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                Enter the House
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                Choose your ritual.
              </h2>
            </div>
            <Link
              href="/products"
              className="-my-2.5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)]"
            >
              View all products
            </Link>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <CategoryPanel
                image="/home/home-fragrance.jpg"
                eyebrow="Fragrance Wardrobe"
                title="                Perfumes, attars, and customised blends"
                text="From saffroned warmth to smoky cedar, build a scent wardrobe for workdays, evenings, and close rituals."
                href="/products?category=Perfume"
                cta="Shop Fragrance"
              />
            </Reveal>
            <Reveal delay={0.12}>
              <CategoryPanel
                image="/home/home-skincare.jpg"
                eyebrow="Skin Rituals"
                title="Cleansers, creams, and polished care"
                text="Soft-focus skincare essentials designed to sit beautifully beside your fragrance collection."
                href="/products?category=Face%20Wash"
                cta="Shop Skincare"
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
                Featured Collection
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                Objects of desire.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--luxury-muted)]">
              A focused selection from the private labels now available in the
              store.
            </p>
          </Reveal>

          <Reveal>
            <FeaturedProductScroller products={featuredProducts} />
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-[1800px]">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                Most Loved
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                The best sellers.
              </h2>
            </div>
            <Link
              href="/products"
              className="-my-2.5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)]"
            >
              View all
            </Link>
          </Reveal>

          <Reveal>
            <ProductGrid products={bestSellers} loading={!loaded} />
          </Reveal>
        </div>
      </section>

      <section className="bg-[#efe3d0] px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-[1800px]">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                Just Arrived
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                New arrivals.
              </h2>
            </div>
            <Link
              href="/products"
              className="-my-2.5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)]"
            >
              Explore new
            </Link>
          </Reveal>

          <Reveal>
            <ProductGrid products={newArrivals} loading={!loaded} />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-[#d8c8ad] bg-[rgba(255,250,242,0.72)] px-4 py-12 backdrop-blur-xl sm:px-6 md:py-16">
        <Reveal className="mx-auto max-w-[1800px]">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-muted)]">
            The Houses &amp; Partners
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
            A fragrance should be worn like a signature &mdash; quietly,
            deliberately, and entirely your own.
          </blockquote>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
            The House Motto
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
              Maison Notes
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
          <Reveal>
            <HousePromise
              title="Curated Discovery"
              text="Shop by gender, category, or house without losing the boutique feel."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <HousePromise
              title="Quiet Product Detail"
              text="Large visuals, variant choices, wishlist controls, and cart previews keep the flow focused."
            />
          </Reveal>
          <Reveal delay={0.2}>
            <HousePromise
              title="Ritual Ready"
              text="Fragrance and skincare now share one polished visual language across the store."
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[#efe3d0] px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
            The List
          </p>
          <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
            Letters from the house.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--luxury-muted)]">
            New releases, private previews, and quiet notes on the collection
            &mdash; sent only when there is something worth saying.
          </p>

          <NewsletterSection />
        </Reveal>
      </section>

      <section className="px-4 py-14 text-center sm:px-6 md:px-8 md:py-24 xl:px-12">
        <Reveal className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
            Begin Again
          </p>
          <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-6xl">
            Find the next signature.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--luxury-muted)]">
            Browse perfumes, attars, customised blends, face washes, creams, and
            nail care from the new house catalogue.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex rounded-full bg-[var(--luxury-ink)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)]"
          >
            Shop the Archive
          </Link>
        </Reveal>
      </section>
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
}: {
  products: Product[];
  loading: boolean;
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
    <div className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
      {products.map((product) => (
        <div
          key={product.id}
          className="min-w-[70%] max-w-[70%] basis-[70%] shrink-0 snap-start md:min-w-0 md:max-w-none md:basis-auto md:shrink"
        >
          <ProductCard product={product} compactMobile />
        </div>
      ))}
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
