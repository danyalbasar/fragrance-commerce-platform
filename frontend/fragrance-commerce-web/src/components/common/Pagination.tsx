"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    pageCount: number;
    onChange: (page: number) => void;
}

function pageNumbers(current: number, total: number): Array<number | "..."> {
    const nums: Array<number | "..."> = [];
    const pages = new Set<number>([1, total, current - 1, current, current + 1]);
    let prev: number | null = null;
    for (let p = 1; p <= total; p++) {
        if (!pages.has(p)) continue;
        if (prev !== null && p - prev > 1) nums.push("...");
        nums.push(p);
        prev = p;
    }
    return nums;
}

export default function Pagination({ page, pageCount, onChange }: PaginationProps) {
    if (pageCount <= 1) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d8c8ad] px-4 py-3 sm:px-6">
            <p className="text-xs text-[var(--luxury-muted)]">
                Page {page} of {pageCount}
            </p>
            <nav className="flex items-center gap-1" aria-label="Pagination">
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                    className="flex h-8 w-8 items-center justify-center border border-[#d8c8ad] text-[var(--luxury-muted)] transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d8c8ad] disabled:hover:text-[var(--luxury-muted)]"
                >
                    <ChevronLeft size={16} />
                </button>
                {pageNumbers(page, pageCount).map((num, i) =>
                    num === "..." ? (
                        <span
                            key={`dot-${i}`}
                            className="flex h-8 w-5 items-center justify-center text-sm text-[var(--luxury-muted)]"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={num}
                            type="button"
                            onClick={() => onChange(num)}
                            aria-current={num === page ? "page" : undefined}
                            className={`h-8 min-w-8 px-2 text-sm font-semibold transition ${
                                num === page
                                    ? "bg-[var(--luxury-ink)] text-[var(--luxury-paper)]"
                                    : "border border-[#d8c8ad] text-[var(--luxury-muted)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-ink)]"
                            }`}
                        >
                            {num}
                        </button>
                    )
                )}
                <button
                    type="button"
                    disabled={page === pageCount}
                    onClick={() => onChange(page + 1)}
                    className="flex h-8 w-8 items-center justify-center border border-[#d8c8ad] text-[var(--luxury-muted)] transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d8c8ad] disabled:hover:text-[var(--luxury-muted)]"
                >
                    <ChevronRight size={16} />
                </button>
            </nav>
        </div>
    );
}
