"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
  Star,
  Sparkles,
  PackageX
} from "lucide-react";
import { productService } from "@/services/productService";
import { addToCart } from "@/services/cartService";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "@/services/wishlistService";
import type { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { ProductReviewsSkeleton } from "@/components/common/ProductReviewsSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProductReviews } from "@/services/reviewService";
import { siteConfig } from "@/config/site";
import type { Review } from "@/types/review";

const ProductReviews = dynamic(
  () => import("@/components/products/ProductReviews"),
  {
    loading: () => <ProductReviewsSkeleton />,
  }
);

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--luxury-ivory)]" />}>
      <ProductDetailsContent />
    </Suspense>
  );
}

function ProductDetailsContent() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const justAddedTimerRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [actionError, setActionError] = useState("");

  const [openSection, setOpenSection] = useState<string | null>("description");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [canScrollSimilarLeft, setCanScrollSimilarLeft] = useState(false);
  const [canScrollSimilarRight, setCanScrollSimilarRight] = useState(false);
  const similarScrollerRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const openReviewModal = searchParams.get("review") === "true";

  useEffect(() => {
    async function loadSimilarProducts(currentProduct: Product) {
      try {
        setSimilarLoading(true);

        const recommendations: Product[] = [];
        const seen = new Set([currentProduct.id]);

        const searchPasses = [
          {
            categoryId: currentProduct.categoryId,
            gender: currentProduct.gender,
          },
          { categoryId: currentProduct.categoryId },
          { gender: currentProduct.gender },
          {},
        ];

        for (const pass of searchPasses) {
          if (recommendations.length >= 3) break;

          const result = await productService.search({
            ...pass,
            sortBy: "createdAt",
            sortDirection: "desc",
            pageNumber: 1,
            pageSize: 6,
          });

          for (const item of result.items) {
            if (seen.has(item.id)) continue;

            seen.add(item.id);
            recommendations.push(item);

            if (recommendations.length >= 3) break;
          }
        }

        setSimilarProducts(recommendations.slice(0, 3));
      } catch {
        setSimilarProducts([]);
      } finally {
        setSimilarLoading(false);
      }
    }

    async function loadProduct() {
      try {
        setSimilarProducts([]);
        setSimilarLoading(false);

        const [productData, reviewData] = await Promise.all([
          productService.getById(id),
          getProductReviews(id),
        ]);

        setProduct(productData);
        setReviews(reviewData);

        const firstVariant = productData.variants[0];
        const primaryImage =
          productData.images.find((image) => image.isPrimary)?.imageUrl ||
          productData.images[0]?.imageUrl ||
          firstVariant?.images?.[0]?.imageUrl ||
          "";

        if (firstVariant) {
          setSelectedVariantId(firstVariant.id);
        }

        setSelectedImageUrl(primaryImage);
        void loadSimilarProducts(productData);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  useEffect(() => {
    async function loadWishlistStatus() {
      try {
        const wishlist = await getWishlist();
        const exists = wishlist.items.some(
          (item) => item.productId === id
        );

        setIsWishlisted(exists);
      } catch {
        setIsWishlisted(false);
      }
    }

    loadWishlistStatus();
  }, [id]);

  const selectedVariant = product?.variants.find(
    (variant) => variant.id === selectedVariantId
  );
  const lowStock =
    selectedVariant &&
    selectedVariant.stockQuantity > 0 &&
    selectedVariant.stockQuantity <= 2;

  const averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const images = [
      ...product.images.map((image) => image.imageUrl),
      ...product.variants.flatMap((variant) =>
        variant.images?.map((image) => image.imageUrl) ?? []
      ),
    ];

    return Array.from(new Set(images.filter(Boolean)));
  }, [product]);

  function formatPrice(price?: number) {
    if (!price) return "₹0";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  async function handleAddToCart() {
    if (!selectedVariant || justAdded) return;

    try {
      setAddingToCart(true);
      setActionError("");

      await addToCart(selectedVariant.id, quantity);

      setJustAdded(true);
      if (justAddedTimerRef.current) {
        window.clearTimeout(justAddedTimerRef.current);
      }
      justAddedTimerRef.current = window.setTimeout(
        () => setJustAdded(false),
        1800
      );

      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      setActionError("Failed to add item to cart.");
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleWishlistClick() {
    if (!product) return;

    try {
      setWishlistLoading(true);
      setActionError("");

      if (isWishlisted) {
        await removeFromWishlist(product.id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(product.id);
        setIsWishlisted(true);
      }

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {
      setActionError("Please login to use wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  }

  function scrollSimilarProducts(direction: "left" | "right") {
    const scroller = similarScrollerRef.current;

    if (!scroller) return;

    scroller.scrollBy({
      left:
        direction === "left"
          ? -scroller.clientWidth * 0.85
          : scroller.clientWidth * 0.85,
      behavior: "smooth",
    });
  }

  const updateSimilarScrollControls = useCallback(() => {
    const scroller = similarScrollerRef.current;

    if (!scroller) return;

    const firstCard = scroller.firstElementChild as HTMLElement | null;
    const lastCard = scroller.lastElementChild as HTMLElement | null;
    const scrollerBounds = scroller.getBoundingClientRect();
    const firstCardBounds = firstCard?.getBoundingClientRect();
    const lastCardBounds = lastCard?.getBoundingClientRect();

    setCanScrollSimilarLeft(
      firstCardBounds ? firstCardBounds.left < scrollerBounds.left - 2 : false
    );
    setCanScrollSimilarRight(
      lastCardBounds ? lastCardBounds.right > scrollerBounds.right + 2 : false
    );
  }, []);

  useEffect(() => {
    updateSimilarScrollControls();

    const scroller = similarScrollerRef.current;

    if (!scroller) return;

    scroller.addEventListener("scroll", updateSimilarScrollControls);
    window.addEventListener("resize", updateSimilarScrollControls);

    return () => {
      scroller.removeEventListener("scroll", updateSimilarScrollControls);
      window.removeEventListener("resize", updateSimilarScrollControls);
    };
  }, [similarProducts.length, similarLoading, updateSimilarScrollControls]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-6 text-[var(--luxury-ink)] sm:py-8 md:px-8">
        <div className="mx-auto max-w-[1600px]">
          <EmptyState
            icon={PackageX}
            title="Product not found"
            description="The fragrance you're looking for may have been removed from the collection."
            actionLabel="Browse Collection"
            actionHref="/products"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-6 text-[var(--luxury-ink)] sm:py-8 md:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${siteConfig.url}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: product.categoryName,
              item: `${siteConfig.url}/products?category=${encodeURIComponent(product.categoryName)}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: `${siteConfig.url}/products/${product.id}`,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: galleryImages,
          description: product.description,
          brand: { "@type": "Brand", name: product.brandName },
          category: product.categoryName,
          sku: product.variants[0]?.sku,
          offers: {
            "@type": "Offer",
            url: `${siteConfig.url}/products/${product.id}`,
            priceCurrency: "INR",
            price:
              product.variants.length > 0
                ? Math.min(
                    ...product.variants.map((variant) => variant.sellingPrice)
                  )
                : 0,
            availability: product.variants.some(
              (variant) => variant.stockQuantity > 0
            )
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
          ...(reviews.length > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: averageRating.toFixed(1),
                  reviewCount: reviews.length,
                },
              }
            : {}),
        }}
      />

      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 text-xs uppercase tracking-[0.12em] text-[var(--luxury-muted)] sm:mb-8 sm:text-sm sm:tracking-[0.18em]">
          <Link href="/" className="-my-3 py-3 hover:text-[var(--luxury-ink)]">
            Home
          </Link>{" "}
          /{" "}
          <Link
            href={`/products?category=${product.categoryName}`}
            className="-my-3 py-3 hover:text-[var(--luxury-ink)]"
          >
            {product.categoryName}
          </Link>{" "}
          / <span className="text-[var(--luxury-ink)]">{product.name}</span>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[50%_1fr] lg:gap-12 xl:gap-16">
          <section className="grid items-start gap-4 md:sticky md:top-28 md:grid-cols-[90px_1fr] md:gap-5">
            <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
              {galleryImages.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  onClick={() => setSelectedImageUrl(imageUrl)}
                  aria-pressed={selectedImageUrl === imageUrl}
                  aria-label={`View image ${index + 1} of ${galleryImages.length}`}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden border bg-[#efe3d0] transition-all duration-200 active:scale-95 sm:h-24 sm:w-24 ${selectedImageUrl === imageUrl
                    ? "border-[var(--luxury-gold)] shadow-[0_10px_24px_rgba(215,173,98,0.28)]"
                    : "border-[#d8c8ad] opacity-70 hover:border-[var(--luxury-gold)] hover:opacity-100"
                    }`}
                >
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-200 hover:scale-105"
                  />
                </button>
              ))}
            </div>

            <div className="order-1 self-start overflow-hidden border border-[#d8c8ad] bg-[#efe3d0] shadow-[0_24px_70px_rgba(22,18,13,0.12)] md:order-2">
              <div className="relative h-[360px] sm:h-[480px] md:h-[580px]">
                <AnimatePresence initial={false}>
                  {selectedImageUrl && (
                    <motion.div
                      key={selectedImageUrl}
                      initial={{ opacity: 0, scale: 1.015 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={selectedImageUrl}
                        alt={product.name}
                        fill
                        priority
                        className="object-cover"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          <section className="lg:pt-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:text-sm sm:tracking-[0.34em]">
                {product.brandName}
              </p>

              <button
                onClick={handleWishlistClick}
                disabled={wishlistLoading}
                className="cursor-pointer p-2.5 transition-all duration-200 hover:scale-110 hover:text-[var(--luxury-gold)] active:scale-90 disabled:opacity-50"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isWishlisted}
              >
                <motion.span
                  key={String(isWishlisted)}
                  initial={{ scale: 0.75 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  <Heart
                    size={22}
                    fill={isWishlisted ? "var(--luxury-gold)" : "none"}
                    className={isWishlisted ? "text-[var(--luxury-gold)]" : "text-current"}
                  />
                </motion.span>
              </button>
            </div>

            <h1 className="mt-3 text-3xl font-normal leading-tight [font-family:var(--font-serif)] sm:text-4xl md:text-6xl">
              {product.name}
            </h1>

            <button
              onClick={() =>
                document
                  .getElementById("reviews")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-3 flex cursor-pointer flex-wrap items-center gap-3 py-2.5 text-sm transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
            >
              <span className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const fillPercent = Math.max(
                    0,
                    Math.min(1, averageRating - (star - 1))
                  );

                  return (
                    <span key={star} className="relative block h-5 w-5">
                      <Star size={20} className="text-[#d8c8ad]" />
                      {fillPercent > 0 && (
                        <span
                          className="absolute inset-y-0 left-0 overflow-hidden"
                          style={{ width: `${fillPercent * 100}%` }}
                        >
                          <Star
                            size={20}
                            className="fill-[var(--luxury-gold)] text-[var(--luxury-gold)]"
                          />
                        </span>
                      )}
                    </span>
                  );
                })}
              </span>

              <span className="font-semibold">
                {averageRating.toFixed(1)}
              </span>

              <span className="text-[var(--luxury-muted)] underline">
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </span>
            </button>

            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--luxury-muted)]">
              {product.description}
            </p>

            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-2xl font-semibold [font-family:var(--font-serif)] sm:text-3xl">
                  {formatPrice(selectedVariant?.sellingPrice)}
                </p>

                {selectedVariant &&
                  selectedVariant.mrp > selectedVariant.sellingPrice && (
                    <>
                      <p className="text-base text-[var(--luxury-muted)] line-through">
                        {formatPrice(selectedVariant.mrp)}
                      </p>

                      <span className="rounded-full bg-[var(--luxury-gold-strong)] px-2.5 py-1 text-xs font-semibold text-[var(--luxury-paper)]">
                        Save{" "}
                        {Math.round(
                          ((selectedVariant.mrp -
                            selectedVariant.sellingPrice) /
                            selectedVariant.mrp) *
                            100
                        )}
                        %
                      </span>
                    </>
                  )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {selectedVariant && (
                  <span className="text-[var(--luxury-muted)]">
                    SKU: {selectedVariant.sku}
                  </span>
                )}

                {lowStock && (
                  <span className="rounded-full border border-[#d7ad62] bg-[#fff6e4] px-3 py-1 text-xs font-medium text-[#8a5a12]">
                    Only {selectedVariant.stockQuantity} left
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em]">
                Select Size
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariantId(variant.id);

                      const variantImage =
                        variant.images?.find(
                          (image) => image.isPrimary
                        )?.imageUrl ||
                        variant.images?.[0]?.imageUrl;

                      if (variantImage) {
                        setSelectedImageUrl(variantImage);
                      }

                      setQuantity(1);
                    }}
                    disabled={variant.stockQuantity <= 0}
                    aria-pressed={selectedVariantId === variant.id}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d8c8ad] sm:px-5 ${selectedVariantId === variant.id
                      ? "border-[var(--luxury-ink)] bg-[var(--luxury-ink)] text-[var(--luxury-paper)] shadow-[0_10px_22px_rgba(22,18,13,0.18)]"
                      : "border-[#d8c8ad] bg-[var(--luxury-paper)] hover:border-[var(--luxury-gold)]"
                      }`}
                  >
                    <span className="flex flex-col items-center gap-0.5">
                      <span>{variant.variantName}</span>
                      {variant.stockQuantity <= 0 ? (
                        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--luxury-muted)]">
                          Out of stock
                        </span>
                      ) : (
                        <span
                          className={`text-[11px] font-medium ${selectedVariantId === variant.id
                            ? "text-[var(--luxury-paper)]/80"
                            : "text-[var(--luxury-muted)]"
                            }`}
                        >
                          {formatPrice(variant.sellingPrice)}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <div className="flex h-11 w-32 items-center justify-between rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)] px-3 transition-colors duration-200 hover:border-[var(--luxury-gold)]">
                <button
                  onClick={() =>
                    setQuantity((value) =>
                      Math.max(1, value - 1)
                    )
                  }
                  disabled={quantity <= 1}
                  className="flex h-full w-10 cursor-pointer items-center justify-center transition-all duration-200 hover:scale-110 hover:text-[var(--luxury-gold)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:text-current"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>

                <motion.span
                  key={quantity}
                  initial={{ opacity: 0.5, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="w-4 text-center font-semibold tabular-nums"
                >
                  {quantity}
                </motion.span>

                <button
                  onClick={() =>
                    setQuantity((value) => value + 1)
                  }
                  disabled={
                    selectedVariant
                      ? quantity >=
                      selectedVariant.stockQuantity
                      : true
                  }
                  className="flex h-full w-10 cursor-pointer items-center justify-center transition-all duration-200 hover:scale-110 hover:text-[var(--luxury-gold)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:text-current"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={
                addingToCart ||
                !selectedVariant ||
                selectedVariant.stockQuantity <= 0
              }
              className={`mt-6 h-12 w-full cursor-pointer rounded-full px-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-paper)] transition-all duration-200 hover:shadow-[0_16px_34px_rgba(22,18,13,0.18)] hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--luxury-muted-strong)] disabled:hover:scale-100 disabled:hover:shadow-none sm:tracking-[0.18em] ${justAdded
                ? "bg-[var(--luxury-moss)]"
                : "bg-[var(--luxury-ink)] hover:bg-[var(--luxury-moss)]"
                }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={justAdded ? "added" : addingToCart ? "adding" : "idle"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-center gap-2"
                >
                  {justAdded ? (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      Added to Cart
                    </>
                  ) : addingToCart ? (
                    "Adding..."
                  ) : (
                    "Add to Cart"
                  )}
                </motion.span>
              </AnimatePresence>
            </button>

            {actionError && (
              <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {actionError}
              </p>
            )}

            <div className="mt-6 grid gap-3 border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 text-sm text-[var(--luxury-muted)]">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} />
                <span>100% authentic products</span>
              </div>

              <div className="flex items-center gap-3">
                <Truck size={18} />
                <span>Free shipping on eligible orders</span>
              </div>

              <div className="flex items-center gap-3">
                <Lock size={18} />
                <span>Secure payments</span>
              </div>

              <div className="flex items-center gap-3">
                <RotateCcw size={18} />
                <span>Easy returns and support</span>
              </div>
            </div>

            <div className="mt-8 border-t border-[#d8c8ad]">
              <Accordion
                title="Description"
                open={openSection === "description"}
                onClick={() =>
                  setOpenSection(
                    openSection === "description"
                      ? null
                      : "description"
                  )
                }
              >
                {product.description}
              </Accordion>

              <Accordion
                title="Product Details"
                open={openSection === "details"}
                onClick={() =>
                  setOpenSection(
                    openSection === "details"
                      ? null
                      : "details"
                  )
                }
              >
                <div className="space-y-2">
                  <p>Brand: {product.brandName}</p>
                  <p>Category: {product.categoryName}</p>
                  <p>Gender: {product.gender}</p>
                  {selectedVariant && (
                    <p>SKU: {selectedVariant.sku}</p>
                  )}
                </div>
              </Accordion>

              <Accordion
                title="Shipping & Returns"
                open={openSection === "shipping"}
                onClick={() =>
                  setOpenSection(
                    openSection === "shipping"
                      ? null
                      : "shipping"
                  )
                }
              >
                Orders are packed carefully and shipped securely.
                Return and exchange rules can be added here
                later.
              </Accordion>
            </div>
          </section>
        </div>
      </div>
      <ProductReviews
        productId={product.id}
        reviews={reviews}
        openReviewModal={openReviewModal}
        onReviewCreated={(review) => {
          setReviews((currentReviews) => [review, ...currentReviews]);
        }}
      />

      <section className="mx-auto mt-12 max-w-[1800px] border-t border-[#d8c8ad] pt-10 sm:mt-16 sm:pt-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
              You May Also Like
            </p>
            <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl">
              More products like this
            </h2>
          </div>

          <Link
            href={`/products?category=${encodeURIComponent(product.categoryName)}`}
            className="-my-2.5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)]"
          >
            View similar
          </Link>
        </div>

        {similarLoading ? (
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
            Curating products...
          </p>
        ) : similarProducts.length > 0 ? (
          <div className="relative max-w-[1538px]">
            {canScrollSimilarLeft && (
              <button
                type="button"
                onClick={() => scrollSimilarProducts("left")}
                className="absolute left-4 top-36 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-[0_14px_30px_rgba(22,18,13,0.18)] transition-all duration-200 hover:scale-105 hover:text-[var(--luxury-gold)] active:scale-90 md:hidden"
                aria-label="Scroll similar products left"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div
              ref={similarScrollerRef}
              onScroll={updateSimilarScrollControls}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3"
            >
              {similarProducts.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="min-w-[calc((100%_-_1rem)/2)] snap-start md:min-w-0"
                >
                  <ProductCard product={item} compactMobile />
                </div>
              ))}
            </div>

            {canScrollSimilarRight && (
              <button
                type="button"
                onClick={() => scrollSimilarProducts("right")}
                className="absolute right-4 top-36 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-[0_14px_30px_rgba(22,18,13,0.18)] transition-all duration-200 hover:scale-105 hover:text-[var(--luxury-gold)] active:scale-90 md:hidden"
                aria-label="Scroll similar products right"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="More picks on the way"
            description="Similar products will appear here as the catalogue grows."
            actionLabel="Browse Collection"
            actionHref="/products"
          />
        )}
      </section>
    </main>
  );
}

function Accordion({
  title,
  open,
  onClick,
  children,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const contentId = useId();

  return (
    <div className="border-b border-[#d8c8ad]">
      <button
        onClick={onClick}
        aria-expanded={open}
        aria-controls={contentId}
        className="group flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-sm font-semibold uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-[#f6ead2]/70 hover:text-[var(--luxury-gold)] sm:tracking-[0.18em]"
      >
        {title}
        <ChevronDown
          size={18}
          className={`shrink-0 transition-all duration-200 ${open
            ? "rotate-180 text-[var(--luxury-gold)]"
            : "group-hover:translate-y-[1px]"
            }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm leading-7 text-[var(--luxury-muted)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
