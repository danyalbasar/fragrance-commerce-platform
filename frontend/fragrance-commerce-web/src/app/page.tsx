import Image from "next/image";
import Link from "next/link";
import FeaturedProductScroller from "@/components/home/FeaturedProductScroller";
import VendorHomeRedirect from "@/components/vendor/VendorHomeRedirect";

const featuredProducts = [
  {
    brand: "Aurelian Atelier",
    name: "Velvet Saffron",
    category: "Unisex Eau de Parfum",
    price: "Rs 5,799",
    image: "https://res.cloudinary.com/dyvti3sda/image/upload/v1782569576/fragrance-commerce/demo-products/aurelian-velvet-saffron.png",
    href: "/products?search=Velvet%20Saffron",
  },
  {
    brand: "Nocturne Vale",
    name: "Cedar Smoke",
    category: "Men's Parfum",
    price: "Rs 3,999",
    image: "https://res.cloudinary.com/dyvti3sda/image/upload/v1782569614/fragrance-commerce/demo-products/nocturne-cedar-smoke.png",
    href: "/products?search=Cedar%20Smoke",
  },
  {
    brand: "Mira Solace",
    name: "Pearl Veil",
    category: "Bright Cream",
    price: "Rs 1,099",
    image: "https://res.cloudinary.com/dyvti3sda/image/upload/v1782569663/fragrance-commerce/demo-products/mira-pearl-veil-cream.png",
    href: "/products?search=Pearl%20Veil",
  },
];

const houses = [
  "Aurelian Atelier",
  "Nocturne Vale",
  "Mira Solace",
  "Vellum & Dew",
];

export default function Home() {
  return (
    <main className="bg-[var(--luxury-ivory)] text-[var(--luxury-ink)]">
      <VendorHomeRedirect />
      <section className="relative isolate min-h-[calc(100svh-65px)] overflow-hidden md:min-h-[calc(100vh-73px)]">
        <Image
          src="/home/home-hero.jpg"
          alt="Luxury fragrance and skincare collection arranged on a warm studio set"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(22,18,13,0.84)_0%,rgba(22,18,13,0.56)_42%,rgba(22,18,13,0.06)_100%)]" />

        <div className="flex min-h-[calc(100svh-65px)] w-full items-center px-4 py-12 sm:px-6 md:min-h-[calc(100vh-73px)] md:px-8 md:py-16 xl:px-12">
          <div className="max-w-2xl text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxury-gold)] sm:tracking-[0.42em]">
              Private Fragrance House
            </p>
            <h1 className="mt-5 text-4xl font-normal leading-[1.02] [font-family:var(--font-serif)] sm:text-5xl md:text-7xl">
              Scent, skincare, and ritual objects for a polished life.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/78 md:text-lg">
              Explore private house labels, expressive perfumes, quiet skincare, and daily essentials staged for discovery.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d8c8ad] bg-[rgba(255,250,242,0.72)] px-4 py-5 backdrop-blur-xl sm:px-6">
        <div className="mx-auto grid max-w-[1800px] gap-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)] sm:tracking-[0.28em] md:grid-cols-4">
          <span>Cloud-like skincare</span>
          <span>Amber-rich attars</span>
          <span>Genderless signatures</span>
          <span>Private house labels</span>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
                Enter the House
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                Choose your ritual.
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold)] hover:text-[var(--luxury-ink)]"
            >
              View all products
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryPanel
              image="/home/home-fragrance.jpg"
              eyebrow="Fragrance Wardrobe"
              title="Perfumes, attars, and custom blends"
              text="From saffroned warmth to smoky cedar, build a scent wardrobe for workdays, evenings, and close rituals."
              href="/products?category=Perfume"
              cta="Shop Fragrance"
            />
            <CategoryPanel
              image="/home/home-skincare.jpg"
              eyebrow="Skin Rituals"
              title="Cleansers, creams, and polished care"
              text="Soft-focus skincare essentials designed to sit beautifully beside your fragrance collection."
              href="/products?category=Face%20Wash"
              cta="Shop Skincare"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#efe3d0] px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
                The Edit
              </p>
              <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-5xl">
                Objects of desire.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--luxury-muted)]">
              A focused selection from the private labels now available in the store.
            </p>
          </div>

          <FeaturedProductScroller products={featuredProducts} />
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto grid max-w-[1800px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-[3/2] overflow-hidden bg-[#efe0ca]">
            <Image
              src="/home/home-ritual.jpg"
              alt="Fragrance and skincare ritual objects on a refined counter"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
              Maison Notes
            </p>
            <h2 className="mt-3 text-3xl font-normal leading-tight [font-family:var(--font-serif)] sm:text-4xl md:text-6xl">
              A storefront for house labels that still feels tactile.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
              The collection is staged like a real luxury catalogue: restrained navigation, visual hierarchy, product-led imagery, and clear paths into fragrance or skincare.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {houses.map((house) => (
                <Link
                  key={house}
                  href={`/products?search=${encodeURIComponent(house)}`}
                  className="border-b border-[#d8c8ad] py-4 text-lg [font-family:var(--font-serif)] transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
                >
                  {house}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-[1800px] gap-8 md:grid-cols-3">
          <Promise title="Curated Discovery" text="Shop by gender, category, or house without losing the boutique feel." />
          <Promise title="Quiet Product Detail" text="Large visuals, variant choices, wishlist controls, and cart previews keep the flow focused." />
          <Promise title="Ritual Ready" text="Fragrance and skincare now share one polished visual language across the store." />
        </div>
      </section>

      <section className="px-4 py-14 text-center sm:px-6 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
            Begin Again
          </p>
          <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl md:text-6xl">
            Find the next signature.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--luxury-muted)]">
            Browse perfumes, attars, custom blends, face washes, creams, and nail care from the new house catalogue.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex rounded-full bg-[var(--luxury-ink)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)]"
          >
            Shop the Archive
          </Link>
        </div>
      </section>
    </main>
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

function Promise({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold)]">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
        {text}
      </p>
    </div>
  );
}
