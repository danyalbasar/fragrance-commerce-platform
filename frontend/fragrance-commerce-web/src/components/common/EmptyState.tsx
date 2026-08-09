"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
  className = "",
}: EmptyStateProps) {
  const buttonClasses = compact
    ? "mt-5 inline-flex items-center justify-center rounded-full bg-[var(--luxury-ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)] shadow-[0_12px_26px_rgba(22,18,13,0.12)] transition-all duration-200 hover:bg-[var(--luxury-moss)] hover:shadow-[0_16px_34px_rgba(22,18,13,0.16)] active:scale-[0.98]"
    : "mt-6 inline-flex items-center justify-center rounded-full bg-[var(--luxury-ink)] px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition-all duration-200 hover:bg-[var(--luxury-moss)] hover:shadow-[0_18px_38px_rgba(22,18,13,0.16)] hover:scale-[1.02] active:scale-[0.98]";

  return (
    <div
      className={`rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] text-center shadow-[var(--luxury-shadow-sm)] ${
        compact ? "p-6 sm:p-8" : "p-8 sm:p-12"
      } ${className}`}
    >
      <div
        className={`relative mx-auto flex items-center justify-center rounded-full border border-[#d8c8ad] bg-[#fffaf2] ${
          compact ? "h-14 w-14" : "h-16 w-16 sm:h-20 sm:w-20"
        }`}
      >
        <Icon
          size={compact ? 22 : 28}
          strokeWidth={1.25}
          className="text-[var(--luxury-gold)]"
        />
        <span className="absolute -inset-1.5 rounded-full border border-[var(--luxury-gold)]/20" />
      </div>

      <h2
        className={`mt-5 font-normal [font-family:var(--font-serif)] ${
          compact ? "text-xl" : "text-2xl sm:text-3xl"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mx-auto mt-3 text-sm leading-6 text-[var(--luxury-muted)] ${
            compact ? "max-w-xs" : "max-w-md"
          }`}
        >
          {description}
        </p>
      )}

      {actionLabel && (actionHref || onAction) &&
        (actionHref ? (
          <Link
            href={actionHref}
            onClick={onAction}
            className={`cursor-pointer ${buttonClasses}`}
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className={`cursor-pointer ${buttonClasses}`}
          >
            {actionLabel}
          </button>
        ))}
    </div>
  );
}
