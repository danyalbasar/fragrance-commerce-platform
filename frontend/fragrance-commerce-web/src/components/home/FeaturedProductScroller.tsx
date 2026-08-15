"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
          aria-label="Scroll featured products left"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <div
        ref={scrollerRef}
        onScroll={updateScrollControls}
        className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
      >
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

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollProducts("right")}
          className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-[0_14px_30px_rgba(22,18,13,0.18)] transition-all duration-200 hover:scale-105 hover:text-[var(--luxury-gold)] active:scale-90 md:hidden"
          aria-label="Scroll featured products right"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
