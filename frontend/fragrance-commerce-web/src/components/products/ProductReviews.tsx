"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ShieldCheck,
    Star,
    ThumbsDown,
    ThumbsUp,
    X,
} from "lucide-react";
import type { Review } from "@/types/review";
import { createProductReview } from "@/services/reviewService";

interface ProductReviewsProps {
    productId: string;
    reviews: Review[];
    openReviewModal?: boolean;
    onReviewCreated: (review: Review) => void;
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

    const averageRating =
        reviews.length === 0
            ? 0
            : reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length;

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

    useEffect(() => {
        if (openReviewModal) {
            setShowModal(true);

            setTimeout(() => {
                document
                    .getElementById("reviews")
                    ?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [openReviewModal]);

    useEffect(() => {
        if (!showModal) return;

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
    }, [showModal]);

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
        } catch (err: any) {
            setError(
                err?.response?.data ||
                "You can only review delivered products that you have purchased."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section
            id="reviews"
            className="mx-auto mt-12 max-w-[1600px] border-t border-[#d8c8ad] pt-10 text-[var(--luxury-ink)]"
        >
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--luxury-gold)]">
                        Customer Reviews
                    </p>

                    <h2 className="mt-2 text-5xl font-normal [font-family:var(--font-serif)]">
                        Reviews
                    </h2>
                </div>

                <button
                    onClick={() => {
                        setShowModal(true);
                        setError("");
                    }}
                    className="h-11 cursor-pointer rounded-full bg-[var(--luxury-ink)] px-8 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)]"
                >
                    Write a Review
                </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
                <aside className="h-fit border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_18px_45px_rgba(22,18,13,0.06)]">
                    <button
                        onClick={() => setRatingFilter(null)}
                        className="group cursor-pointer text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-semibold transition group-hover:opacity-70">
                                {averageRating.toFixed(1)}
                            </span>

                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={22}
                                        className={
                                            star <= Math.round(averageRating)
                                                ? "fill-[var(--luxury-gold)] text-[var(--luxury-gold)]"
                                                : "text-[#d8c8ad]"
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                            Based on {reviews.length}{" "}
                            {reviews.length === 1 ? "review" : "reviews"}
                        </p>
                    </button>

                    <div className="mt-5 space-y-1">
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
                                        setRatingFilter(
                                            isActive ? null : ratingValue
                                        )
                                    }
                                    className={`grid w-full cursor-pointer grid-cols-[48px_1fr_32px] items-center gap-3 px-3 py-2 text-left text-sm transition ${isActive
                                            ? "border border-[var(--luxury-gold)] bg-[#f6ead2] text-[var(--luxury-ink)]"
                                            : "hover:bg-[#efe3d0]"
                                        }`}
                                >
                                    <span className="font-medium">
                                        {ratingValue} ★
                                    </span>

                                    <div
                                        className={`h-2 overflow-hidden rounded-full ${isActive
                                                ? "bg-[#e1cfaa]"
                                                : "bg-[#d8c8ad]"
                                            }`}
                                    >
                                        <div
                                            className={`h-full rounded-full ${isActive
                                                    ? "bg-[var(--luxury-gold)]"
                                                    : "bg-[var(--luxury-gold)]"
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    <span
                                        className={`text-right ${isActive
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
                </aside>

                <div>
                    <div className="mb-4 flex flex-col gap-3 border-b border-[#d8c8ad] pb-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-[var(--luxury-muted)]">
                                Showing {filteredReviews.length} of{" "}
                                {reviews.length}{" "}
                                {reviews.length === 1 ? "review" : "reviews"}
                            </p>

                            {ratingFilter && (
                                <p className="mt-0.5 text-sm font-medium text-[var(--luxury-ink)]">
                                    Showing only {ratingFilter}-star reviews
                                </p>
                            )}
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-10 min-w-44 border border-[#d8c8ad] bg-[var(--luxury-paper)] px-3 text-sm uppercase tracking-[0.08em] outline-none hover:border-[var(--luxury-gold)]"
                        >
                            <option value="newest">Most Recent</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                        </select>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-8">
                            <h3 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                No reviews yet
                            </h3>

                            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                Reviews will appear here after customers receive
                                their orders.
                            </p>
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-8">
                            <h3 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                No matching reviews
                            </h3>

                            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                Try selecting another rating.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#d8c8ad] border border-[#d8c8ad] bg-[var(--luxury-paper)] px-6">
                            {filteredReviews.map((review) => (
                                <article key={review.id} className="py-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#efe3d0] text-xs font-bold text-[var(--luxury-ink)]">
                                                {getInitials(review.userName)}
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-[15px] font-semibold">
                                                        {review.userName}
                                                    </p>

                                                    {review.isVerifiedPurchase && (
                                                        <span className="flex items-center gap-1 text-xs font-medium text-[var(--luxury-gold)]">
                                                            <ShieldCheck
                                                                size={13}
                                                            />
                                                            Verified Buyer
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-0.5 text-sm text-[var(--luxury-muted)]">
                                                    {formatDate(
                                                        review.createdAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={18}
                                                    className={
                                                        star <= review.rating
                                                            ? "fill-[var(--luxury-gold)] text-[var(--luxury-gold)]"
                                                            : "text-[#d8c8ad]"
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 pl-0 md:pl-[56px]">
                                        {review.title && (
                                            <h3 className="text-lg font-normal [font-family:var(--font-serif)]">
                                                {review.title}
                                            </h3>
                                        )}

                                        {review.comment && (
                                            <p className="mt-2 max-w-5xl text-[15px] leading-7 text-[var(--luxury-muted)]">
                                                {review.comment}
                                            </p>
                                        )}

                                        {review.images?.length > 0 && (
                                            <div className="mt-4 flex gap-3">
                                                {review.images
                                                    .sort(
                                                        (a, b) =>
                                                            a.displayOrder -
                                                            b.displayOrder
                                                    )
                                                    .map((image) => (
                                                        <img
                                                            key={image.id}
                                                            src={image.imageUrl}
                                                            alt="Review image"
                                                            className="h-16 w-16 border border-[#d8c8ad] object-cover"
                                                        />
                                                    ))}
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center gap-4 text-sm text-[var(--luxury-muted)]">
                                            <button className="flex cursor-pointer items-center gap-1 hover:text-[var(--luxury-gold)]">
                                                <ThumbsUp size={15} />
                                                0
                                            </button>

                                            <button className="flex cursor-pointer items-center gap-1 hover:text-[var(--luxury-gold)]">
                                                <ThumbsDown size={15} />
                                                0
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overscroll-none bg-[rgba(22,18,13,0.48)] px-4 py-6 backdrop-blur-[1px]">
                    <div className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-y-auto overscroll-contain border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_30px_90px_rgba(22,18,13,0.28)] sm:p-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-[var(--luxury-gold)]">
                                    Review Product
                                </p>

                                <h3 className="mt-2 text-4xl font-normal [font-family:var(--font-serif)]">
                                    Write a Review
                                </h3>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="cursor-pointer rounded-full p-2 transition hover:bg-[#efe3d0]"
                            >
                                <X size={20} />
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
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() =>
                                                setHoverRating(star)
                                            }
                                            onMouseLeave={() =>
                                                setHoverRating(0)
                                            }
                                            onClick={() => setRating(star)}
                                            className="cursor-pointer"
                                        >
                                            <Star
                                                size={32}
                                                className={
                                                    active
                                                        ? "fill-[var(--luxury-gold)] text-[var(--luxury-gold)]"
                                                        : "text-[#d8c8ad]"
                                                }
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="text-sm font-semibold uppercase tracking-[0.14em]">
                                Review Title
                            </label>

                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Example: Long lasting and elegant"
                                className="mt-2 w-full border border-[#d8c8ad] bg-[#fffaf2] px-4 py-3 outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                        </div>

                        <div className="mt-5">
                            <label className="text-sm font-semibold uppercase tracking-[0.14em]">
                                Your Review
                            </label>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this product..."
                                rows={5}
                                className="mt-2 w-full resize-none border border-[#d8c8ad] bg-[#fffaf2] px-4 py-3 outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                        </div>

                        {error && (
                            <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="cursor-pointer rounded-full border border-[#d8c8ad] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--luxury-gold)]"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmitReview}
                                disabled={submitting}
                                className="cursor-pointer rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
