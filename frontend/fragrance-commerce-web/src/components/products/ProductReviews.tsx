"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { getApiResponse } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ShieldCheck,
    Star,
    ThumbsDown,
    ThumbsUp,
    X,
} from "lucide-react";
import type { Review, ReviewImage } from "@/types/review";
import { createProductReview } from "@/services/reviewService";
import { EmptyState } from "@/components/common/EmptyState";

const REVIEWS_PER_PAGE = 4;

interface LightboxState {
    images: ReviewImage[];
    index: number;
}

interface ProductReviewsProps {
    productId: string;
    reviews: Review[];
    openReviewModal?: boolean;
    onReviewCreated: (review: Review) => void;
}

function getPageItems(current: number, total: number): (number | "…")[] {
    const items: (number | "…")[] = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || Math.abs(i - current) <= 1) {
            items.push(i);
        } else if (items[items.length - 1] !== "…") {
            items.push("…");
        }
    }
    return items;
}

export default function ProductReviews({
    productId,
    reviews,
    openReviewModal = false,
    onReviewCreated,
}: ProductReviewsProps) {
    const [showModal, setShowModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [sortBy, setSortBy] = useState("newest");
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [lightbox, setLightbox] = useState<LightboxState | null>(null);
    const reviewModalRef = useRef<HTMLDivElement>(null);

    const averageRating =
        reviews.length === 0
            ? 0
            : reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length;
    const fillPercent =
        reviews.length === 0 ? 0 : (averageRating / 5) * 100;

    const filteredReviews = useMemo(() => {
        let data = [...reviews];

        if (ratingFilter) {
            data = data.filter((review) => review.rating === ratingFilter);
        }

        if (sortBy === "highest") {
            data.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "lowest") {
            data.sort((a, b) => a.rating - b.rating);
        } else {
            data.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
        }

        return data;
    }, [reviews, sortBy, ratingFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE)
    );
    const currentPage = Math.min(page, totalPages);
    const listStart =
        filteredReviews.length === 0
            ? 0
            : (currentPage - 1) * REVIEWS_PER_PAGE + 1;
    const listEnd = Math.min(
        filteredReviews.length,
        currentPage * REVIEWS_PER_PAGE
    );
    const pagedReviews = filteredReviews.slice(
        (currentPage - 1) * REVIEWS_PER_PAGE,
        currentPage * REVIEWS_PER_PAGE
    );

    useEffect(() => {
        if (!openReviewModal) return;

        const timer = window.setTimeout(() => {
            setShowModal(true);

            document
                .getElementById("reviews")
                ?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        return () => window.clearTimeout(timer);
    }, [openReviewModal]);

    useEffect(() => {
        if (!showModal) return;

        const scrollY = window.scrollY;
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;
        const originalWidth = document.body.style.width;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const previouslyFocused = document.activeElement as HTMLElement | null;

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        const modal = reviewModalRef.current;
        modal?.focus();

        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setShowModal(false);
                return;
            }

            if (e.key !== "Tab" || !modal) return;

            const focusables = modal.querySelectorAll<
                HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement
            >(
                'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
            );
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", onKey);

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.top = originalTop;
            document.body.style.width = originalWidth;
            window.scrollTo(0, scrollY);
            document.removeEventListener("keydown", onKey);
            previouslyFocused?.focus();
        };
    }, [showModal]);

    useEffect(() => {
        if (!lightbox) return;

        const scrollY = window.scrollY;
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;
        const originalWidth = document.body.style.width;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.top = originalTop;
            document.body.style.width = originalWidth;
            window.scrollTo(0, scrollY);
        };
    }, [lightbox]);

    useEffect(() => {
        if (!lightbox) return;

        const lb = lightbox;

        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setLightbox(null);
            } else if (e.key === "ArrowLeft") {
                const count = lb.images.length;
                setLightbox({
                    images: lb.images,
                    index: (lb.index - 1 + count) % count,
                });
            } else if (e.key === "ArrowRight") {
                const count = lb.images.length;
                setLightbox({
                    images: lb.images,
                    index: (lb.index + 1) % count,
                });
            }
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [lightbox]);

    function getRatingCount(ratingValue: number) {
        return reviews.filter((review) => review.rating === ratingValue).length;
    }

    function getInitials(name: string) {
        return name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    function handleRatingFilter(value: number | null) {
        setRatingFilter(value);
        setPage(1);
    }

    function handleSortChange(value: string) {
        setSortBy(value);
        setPage(1);
    }

    async function handleSubmitReview() {
        if (!rating) {
            setError("Please select a rating.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const createdReview = await createProductReview(productId, {
                rating,
                title: title.trim() || undefined,
                comment: comment.trim() || undefined,
                images: [],
            });

            onReviewCreated(createdReview);

            setShowModal(false);
            setRating(5);
            setHoverRating(0);
            setTitle("");
            setComment("");
        } catch (err: unknown) {
            const response = getApiResponse(err);
            setError(
                typeof response?.data === "string"
                    ? response.data
                    : "You can only review delivered products that you have purchased."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section
            id="reviews"
            className="mx-auto mt-12 max-w-[1600px] border-t border-[#d8c8ad] pt-12 text-[var(--luxury-ink)]"
        >
            <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                        Customer Reviews
                    </p>

                    <h2 className="mt-3 text-4xl font-normal leading-[1.05] [font-family:var(--font-serif)] sm:text-5xl">
                        Reviews
                    </h2>

                    {reviews.length > 0 && (
                        <p className="mt-3 text-sm text-[var(--luxury-muted)]">
                            Honest notes from customers who brought the house
                            home.
                        </p>
                    )}
                </div>

                <button
                    onClick={() => {
                        setShowModal(true);
                        setError("");
                    }}
                    className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[var(--luxury-ink)] px-8 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition-all duration-200 hover:bg-[var(--luxury-moss)] hover:shadow-[0_18px_38px_rgba(22,18,13,0.16)] hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Star
                        size={16}
                        className="text-[var(--luxury-gold)] transition-transform duration-200 group-hover:rotate-[-8deg] group-hover:scale-110"
                    />
                    Write a Review
                </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
                <aside className="h-fit rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6">
                    <button
                        onClick={() => handleRatingFilter(null)}
                        className="group cursor-pointer rounded-[var(--luxury-radius)] text-left transition-colors duration-200 hover:bg-[#f6ead2]"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-5xl font-semibold leading-none tracking-tight transition duration-300 group-hover:opacity-70 [font-family:var(--font-serif)]">
                                {averageRating.toFixed(1)}
                            </span>

                            <div className="flex items-center">
                                <div className="relative inline-flex">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={22}
                                                className="text-[#d8c8ad]"
                                            />
                                        ))}
                                    </div>

                                    <div
                                        className="absolute inset-0 overflow-hidden"
                                        style={{ width: `${fillPercent}%` }}
                                    >
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={22}
                                                    className="shrink-0 fill-[var(--luxury-gold)] text-[var(--luxury-gold)]"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-3 text-sm text-[var(--luxury-muted)]">
                            Based on {reviews.length}{" "}
                            {reviews.length === 1 ? "review" : "reviews"}
                        </p>
                    </button>

                    <div className="mt-6 border-t border-[#e4d8bf] pt-5">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--luxury-muted)]">
                            Rating Breakdown
                        </p>

                        <div className="space-y-1">
                            {[5, 4, 3, 2, 1].map((ratingValue) => {
                                const count = getRatingCount(ratingValue);
                                const percentage =
                                    reviews.length === 0
                                        ? 0
                                        : (count / reviews.length) * 100;

                                const isActive = ratingFilter === ratingValue;

                                return (
                                    <button
                                        key={ratingValue}
                                        onClick={() =>
                                            handleRatingFilter(
                                                isActive ? null : ratingValue
                                            )
                                        }
                                        className={`group grid w-full cursor-pointer grid-cols-[52px_1fr_36px] items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:translate-x-0.5 active:scale-[0.98] ${
                                            isActive
                                                ? "border border-[var(--luxury-gold)] bg-[#f6ead2] shadow-[0_8px_20px_rgba(22,18,13,0.08)]"
                                                : "border border-transparent hover:bg-[#efe3d0]"
                                        }`}
                                    >
                                        <span
                                            className={`font-semibold transition-colors duration-200 group-hover:text-[var(--luxury-gold)] ${
                                                isActive
                                                    ? "text-[var(--luxury-ink)]"
                                                    : "text-[var(--luxury-muted)]"
                                            }`}
                                        >
                                            {ratingValue} ★
                                        </span>

                                        <div className="h-1.5 overflow-hidden rounded-full bg-[#d8c8ad] transition-colors duration-300 group-hover:bg-[#d1ab67]">
                                            <motion.div
                                                className="h-full rounded-full bg-[var(--luxury-gold)]"
                                                initial={false}
                                                animate={{
                                                    width: `${percentage}%`,
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    ease: [0.22, 1, 0.36, 1],
                                                }}
                                            />
                                        </div>

                                        <span
                                            className={`text-right font-semibold transition-colors duration-200 group-hover:text-[var(--luxury-gold)] ${
                                                isActive
                                                    ? "text-[var(--luxury-ink)]"
                                                    : "text-[var(--luxury-muted)]"
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {ratingFilter && (
                            <button
                                onClick={() => handleRatingFilter(null)}
                                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[var(--luxury-line)] py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--luxury-muted)] transition-all duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
                            >
                                <X size={13} />
                                Clear {ratingFilter}-star filter
                            </button>
                        )}
                    </div>
                </aside>

                <div>
                    <div className="mb-5 flex flex-col gap-4 border-b border-[#d8c8ad] pb-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-[var(--luxury-muted)]">
                                Showing {listStart}–{listEnd} of{" "}
                                {filteredReviews.length}{" "}
                                {filteredReviews.length === 1
                                    ? "review"
                                    : "reviews"}
                            </p>

                            {ratingFilter && (
                                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#f6ead2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#8a641f]">
                                    {ratingFilter}-star reviews
                                    <button
                                        type="button"
                                        onClick={() => handleRatingFilter(null)}
                                        className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#e6d5ae]"
                                        aria-label="Clear rating filter"
                                    >
                                        <X size={11} />
                                    </button>
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    handleSortChange(e.target.value)
                                }
                                aria-label="Sort reviews by"
                                className="h-11 w-full min-w-44 cursor-pointer appearance-none rounded-full border border-[var(--luxury-line)] bg-[var(--luxury-paper)] pl-4 pr-10 text-sm font-semibold uppercase tracking-[0.08em] outline-none transition-all duration-200 hover:border-[var(--luxury-gold)] focus:border-[var(--luxury-gold)] md:w-auto"
                            >
                                <option value="newest">Most Recent</option>
                                <option value="highest">
                                    Highest Rating
                                </option>
                                <option value="lowest">Lowest Rating</option>
                            </select>

                            <ChevronDown
                                size={16}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--luxury-muted)]"
                            />
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <EmptyState
                                icon={Star}
                                title="No reviews yet"
                                description="Reviews will appear here after customers receive their orders."
                                actionLabel="Write a Review"
                                onAction={() => {
                                    setShowModal(true);
                                    setError("");
                                }}
                            />
                        </motion.div>
                    ) : filteredReviews.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <EmptyState
                                icon={Star}
                                title="No matching reviews"
                                description="Try selecting another rating to see those reviews."
                                actionLabel="Show All Reviews"
                                onAction={() => handleRatingFilter(null)}
                            />
                        </motion.div>
                    ) : (
                        <>
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={currentPage}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{
                                        duration: 0.2,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="space-y-4"
                                >
                                    {pagedReviews.map((review, index) => {
                                        const sortedImages = [
                                            ...(review.images ?? []),
                                        ].sort(
                                            (a, b) =>
                                                a.displayOrder - b.displayOrder
                                        );

                                        return (
                                            <motion.article
                                                key={review.id}
                                                layout
                                                initial={{
                                                    opacity: 0,
                                                    y: 12,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    duration: 0.25,
                                                    delay: Math.min(
                                                        index * 0.05,
                                                        0.4
                                                    ),
                                                    ease: [0.22, 1, 0.36, 1],
                                                }}
                                                className="group/card rounded-[var(--luxury-radius)] border border-[#e4d8bf] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--luxury-gold)]/50 hover:shadow-[0_18px_40px_rgba(22,18,13,0.1)] sm:p-6"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e4d8bf] bg-gradient-to-b from-[#f6ead2] to-[#efe3d0] text-xs font-bold tracking-wide text-[#8a641f] shadow-[inset_0_1px_3px_rgba(22,18,13,0.08)]">
                                                            {getInitials(
                                                                review.userName
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-[15px] font-semibold">
                                                                    {
                                                                        review.userName
                                                                    }
                                                                </p>

                                                                {review.isVerifiedPurchase && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f6ead2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a641f]">
                                                                        <ShieldCheck
                                                                            size={12}
                                                                            className="text-[#a97a2f]"
                                                                        />
                                                                        Verified
                                                                        Buyer
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--luxury-muted)]">
                                                                {formatDate(
                                                                    review.createdAt
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <Star
                                                                    key={star}
                                                                    size={17}
                                                                    className={
                                                                        star <=
                                                                        review.rating
                                                                            ? "fill-[var(--luxury-gold)] text-[var(--luxury-gold)]"
                                                                            : "text-[#d8c8ad]"
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pl-0 md:pl-[56px]">
                                                    {review.title && (
                                                        <h3 className="text-lg font-semibold leading-snug [font-family:var(--font-serif)]">
                                                            {review.title}
                                                        </h3>
                                                    )}

                                                    {review.comment && (
                                                        <p className="mt-2 max-w-5xl text-[15px] leading-7 text-[var(--luxury-muted)]">
                                                            {review.comment}
                                                        </p>
                                                    )}

                                                    {sortedImages.length > 0 && (
                                                        <div className="mt-5 flex flex-wrap gap-2.5">
                                                            {sortedImages.map(
                                                                (
                                                                    image,
                                                                    imgIndex
                                                                ) => (
                                                                    <button
                                                                        key={
                                                                            image.id
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setLightbox(
                                                                                {
                                                                                    images: sortedImages,
                                                                                    index: imgIndex,
                                                                                }
                                                                            )
                                                                        }
                                                                        className="group/img h-20 w-20 cursor-pointer overflow-hidden rounded-md border border-[#e4d8bf] transition-all duration-300 hover:border-[var(--luxury-gold)] hover:shadow-[0_10px_24px_rgba(22,18,13,0.14)]"
                                                                    >
                                                                        <Image
                                                                            src={
                                                                                image.imageUrl
                                                                            }
                                                                            alt={
                                                                                review.title ||
                                                                                "Review image"
                                                                            }
                                                                            width={80}
                                                                            height={80}
                                                                            sizes="80px"
                                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                                                                        />
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="mt-5 flex items-center gap-2 border-t border-[#f0e6d4] pt-4">
                                                        <button className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--luxury-muted)] transition-all duration-200 hover:bg-[#f6ead2] hover:text-[var(--luxury-gold)]">
                                                            <ThumbsUp
                                                                size={14}
                                                            />
                                                            Helpful{" "}
                                                            <span className="font-bold">
                                                                0
                                                            </span>
                                                        </button>

                                                        <button
                                                            aria-label="Mark not helpful"
                                                            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--luxury-muted)] transition-all duration-200 hover:bg-[#f6ead2] hover:text-[var(--luxury-gold)]"
                                                        >
                                                            <ThumbsDown
                                                                size={14}
                                                            />
                                                            0
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.article>
                                        );
                                    })}
                                </motion.div>
                            </AnimatePresence>

                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between gap-4">
                                    <button
                                        onClick={() =>
                                            setPage(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--luxury-line)] bg-[var(--luxury-paper)] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--luxury-muted)] transition-all duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        <ChevronLeft size={15} />
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        {getPageItems(
                                            currentPage,
                                            totalPages
                                        ).map((item, i) =>
                                            item === "…" ? (
                                                <span
                                                    key={`ellipsis-${i}`}
                                                    className="px-1 text-sm text-[var(--luxury-muted)]"
                                                >
                                                    …
                                                </span>
                                            ) : (
                                                <motion.button
                                                    key={item}
                                                    whileTap={{
                                                        scale: 0.9,
                                                    }}
                                                    onClick={() =>
                                                        setPage(item)
                                                    }
                                                    aria-current={
                                                        item === currentPage
                                                            ? "page"
                                                            : undefined
                                                    }
                                                    className={`h-9 w-9 cursor-pointer rounded-full text-sm font-semibold transition-all duration-200 ${
                                                        item === currentPage
                                                            ? "bg-[var(--luxury-ink)] text-[var(--luxury-paper)] shadow-[0_10px_24px_rgba(22,18,13,0.18)]"
                                                            : "border border-[var(--luxury-line)] bg-[var(--luxury-paper)] text-[var(--luxury-muted)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
                                                    }`}
                                                >
                                                    {item}
                                                </motion.button>
                                            )
                                        )}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setPage(currentPage + 1)
                                        }
                                        disabled={
                                            currentPage === totalPages
                                        }
                                        className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--luxury-line)] bg-[var(--luxury-paper)] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--luxury-muted)] transition-all duration-200 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        Next
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {lightbox && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(22,18,13,0.78)] p-4 backdrop-blur-[3px]"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        type="button"
                        onClick={() => setLightbox(null)}
                        className="absolute right-5 top-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[rgba(255,250,242,0.12)] text-[var(--luxury-paper)] backdrop-blur transition-all duration-200 hover:bg-[rgba(255,250,242,0.24)] hover:scale-110"
                        aria-label="Close image viewer"
                    >
                        <X size={22} />
                    </button>

                    {lightbox.images.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                const count = lightbox.images.length;
                                setLightbox({
                                    images: lightbox.images,
                                    index:
                                        (lightbox.index - 1 + count) % count,
                                });
                            }}
                            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[rgba(255,250,242,0.12)] text-[var(--luxury-paper)] backdrop-blur transition-all duration-200 hover:bg-[rgba(255,250,242,0.24)] hover:scale-110 sm:left-8"
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <motion.div
                        key={lightbox.index}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.22,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex max-w-full flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="relative flex max-w-full items-center justify-center"
                            style={{
                                width: "min(90vw, 1400px)",
                                height: "min(76vh, 1400px)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={lightbox.images[lightbox.index].imageUrl}
                                alt="Review image enlarged"
                                fill
                                sizes="90vw"
                                className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] object-contain"
                            />
                        </div>

                        {lightbox.images.length > 1 && (
                            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-paper)]">
                                {lightbox.index + 1} /{" "}
                                {lightbox.images.length}
                            </p>
                        )}
                    </motion.div>

                    {lightbox.images.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                const count = lightbox.images.length;
                                setLightbox({
                                    images: lightbox.images,
                                    index:
                                        (lightbox.index + 1) % count,
                                });
                            }}
                            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[rgba(255,250,242,0.12)] text-[var(--luxury-paper)] backdrop-blur transition-all duration-200 hover:bg-[rgba(255,250,242,0.24)] hover:scale-110 sm:right-8"
                            aria-label="Next image"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>
            )}

            {showModal && (
                <div
                    ref={reviewModalRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="review-modal-title"
                    tabIndex={-1}
                    className="fixed inset-0 z-50 flex items-center justify-center overscroll-none bg-[rgba(22,18,13,0.48)] px-4 py-6 backdrop-blur-[2px]"
                >
                    <div className="flex max-h-[calc(100dvh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[0_30px_90px_rgba(22,18,13,0.28)]">
                        <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-[var(--luxury-gold-strong)]">
                                    Review Product
                                </p>

                                <h3 id="review-modal-title" className="mt-2 text-4xl font-normal [font-family:var(--font-serif)]">
                                    Write a Review
                                </h3>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="group cursor-pointer rounded-full p-2 transition-all duration-300 hover:bg-[#efe3d0] hover:scale-110"
                                aria-label="Close review form"
                            >
                                <X size={20} className="transition-transform duration-300 group-hover:rotate-90" />
                            </button>
                        </div>

                        <div className="mt-6">
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em]">
                                Your Rating
                            </p>

                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const active =
                                        star <= (hoverRating || rating);

                                    return (
                                        <motion.button
                                            key={star}
                                            type="button"
                                            whileHover={{ scale: 1.15 }}
                                            whileTap={{ scale: 0.88 }}
                                            transition={{ duration: 0.15 }}
                                            onMouseEnter={() =>
                                                setHoverRating(star)
                                            }
                                            onMouseLeave={() =>
                                                setHoverRating(0)
                                            }
                                            onClick={() => setRating(star)}
                                            className="cursor-pointer"
                                            aria-label={`Rate ${star} of 5 stars`}
                                        >
                                            <Star
                                                size={32}
                                                className={`transition-colors duration-200 ${
                                                    active
                                                        ? "fill-[var(--luxury-gold)] text-[var(--luxury-gold)]"
                                                        : "text-[#d8c8ad]"
                                                }`}
                                            />
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-5">
                            <label
                                htmlFor="review-title"
                                className="text-sm font-semibold uppercase tracking-[0.14em]"
                            >
                                Review Title
                            </label>

                            <input
                                id="review-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Example: Long lasting and elegant"
                                className="mt-2 w-full rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-input)] px-4 py-3 outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                        </div>

                        <div className="mt-5">
                            <label
                                htmlFor="review-comment"
                                className="text-sm font-semibold uppercase tracking-[0.14em]"
                            >
                                Your Review
                            </label>

                            <textarea
                                id="review-comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this product..."
                                rows={5}
                                className="mt-2 w-full resize-none rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-input)] px-4 py-3 outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="mt-4 rounded-[var(--luxury-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="cursor-pointer rounded-full border border-[var(--luxury-line)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--luxury-gold)] sm:px-6 sm:py-3 sm:text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmitReview}
                                disabled={submitting}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition hover:bg-[var(--luxury-moss)] hover:shadow-[0_18px_38px_rgba(22,18,13,0.16)] disabled:cursor-not-allowed disabled:bg-[var(--luxury-muted-strong)] sm:px-6 sm:py-3 sm:text-sm"
                            >
                                {submitting && (
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />
                                )}
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Review"}
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
