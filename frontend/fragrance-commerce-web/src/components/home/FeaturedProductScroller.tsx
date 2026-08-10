"use client";

import Image from "next/image";
import Link from "next/link";

type FeaturedProduct = {
  brand: string;
  name: string;
  category: string;
  price: string;
  image: string;
  href: string;
};

export default function FeaturedProductScroller({
  products,
}: {
  products: FeaturedProduct[];
}) {
  return (
    <div className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
      {products.map((product) => (
        <Link
          key={product.name}
          href={product.href}
          className="group flex min-w-[70%] max-w-[70%] basis-[70%] shrink-0 snap-start flex-col border border-[#d8c8ad] bg-[var(--luxury-paper)] transition-all duration-300 hover:-translate-y-2 hover:border-[var(--luxury-gold)] hover:shadow-[0_30px_80px_rgba(22,18,13,0.18)] md:min-w-0 md:max-w-none md:basis-auto md:shrink"
        >
          <div className="relative aspect-[1/1.18] overflow-hidden bg-[#ead9c0] md:h-[390px] md:aspect-auto">
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(min-width: 768px) 33vw, 70vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>

          <div className="flex flex-1 flex-col p-3 sm:p-5 md:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--luxury-gold-strong)] transition-colors duration-300 group-hover:text-[var(--luxury-gold-strong)] sm:text-xs sm:tracking-[0.26em]">
              {product.brand}
            </p>

            <div className="mt-2 flex flex-1 flex-col gap-2 sm:mt-3 md:flex-row md:items-start md:justify-between md:gap-4">
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-base font-normal leading-tight [font-family:var(--font-serif)] transition-colors duration-300 group-hover:text-[var(--luxury-gold-strong)] sm:text-2xl md:text-3xl">
                  {product.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--luxury-muted-strong)] transition-colors duration-300 group-hover:text-[var(--luxury-ink)] sm:text-sm">
                  {product.category}
                </p>
              </div>

              <p className="mt-auto text-base font-semibold transition-all duration-300 group-hover:text-[var(--luxury-gold-strong)] md:mt-0 sm:text-lg">
                {product.price}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
