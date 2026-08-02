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
    requestAnimationFrame(updateScrollControls);

    const scroller = scrollerRef.current;

    if (!scroller) return;

    scroller.addEventListener("scroll", updateScrollControls);
    window.addEventListener("resize", updateScrollControls);

    return () => {
      scroller.removeEventListener("scroll", updateScrollControls);
      window.removeEventListener("resize", updateScrollControls);
    };
  }, [products.length, updateScrollControls]);

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollProducts("left")}
          className="absolute left-4 top-36 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-[0_14px_30px_rgba(22,18,13,0.18)] transition md:hidden"
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
            className="group flex min-w-[calc((100%_-_1rem)/2)] max-w-[calc((100%_-_1rem)/2)] shrink-0 basis-[calc((100%_-_1rem)/2)] snap-start flex-col border border-[#d8c8ad] bg-[var(--luxury-paper)] transition hover:-translate-y-1 hover:border-[var(--luxury-gold)] hover:shadow-[0_24px_70px_rgba(22,18,13,0.14)] md:min-w-0 md:max-w-none md:basis-auto md:shrink"
          >
            <div className="relative aspect-[1/1.18] overflow-hidden bg-[#ead9c0] md:h-[390px] md:aspect-auto">
              <Image
                src={product.image}
                alt={`${product.brand} ${product.name}`}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-5 md:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--luxury-gold)] sm:text-xs sm:tracking-[0.26em]">
                {product.brand}
              </p>

              <div className="mt-2 flex flex-1 flex-col gap-2 sm:mt-3 md:flex-row md:items-start md:justify-between md:gap-4">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-base font-normal leading-tight [font-family:var(--font-serif)] sm:text-2xl md:text-3xl">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--luxury-muted)] sm:text-sm">
                    {product.category}
                  </p>
                </div>

                <p className="mt-auto text-base font-semibold md:mt-0 sm:text-lg">{product.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollProducts("right")}
          className="absolute right-4 top-36 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-[0_14px_30px_rgba(22,18,13,0.18)] transition md:hidden"
          aria-label="Scroll featured products right"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
