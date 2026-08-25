"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPublicSettings } from "@/services/siteSettingsService";

export default function NotFoundPage() {
  const [cms, setCms] = useState<Record<string, string>>({});

  useEffect(() => {
    getPublicSettings().then(setCms).catch(() => {});
  }, []);
  return (
    <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-14 text-[var(--luxury-ink)] md:px-10 md:py-20">
      <section className="mx-auto max-w-6xl">
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          {/* Luxury 404 Display */}
          <div className="relative mb-12">
            <div className="text-[120px] font-normal leading-none [font-family:var(--font-serif)] text-[var(--luxury-gold)]/20 sm:text-[200px] md:text-[280px]">
              404
            </div>

            {/* Elegant CSS Illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-32 w-32 sm:h-48 sm:w-48">
                {/* perfume bottle illustration using CSS */}
                <div className="absolute inset-0 rounded-full border-2 border-[var(--luxury-gold)]/30">
                  <div className="absolute inset-4 rounded-full bg-gradient-to-b from-[var(--luxury-gold)]/10 to-transparent" />
                  <div className="absolute -inset-2 rounded-full border border-[var(--luxury-gold)]/20 animate-pulse" />
                </div>
                {/* decorative elements */}
                <div className="absolute -inset-6">
                  <div className="h-full w-full rounded-full border border-[var(--luxury-gold)]/10 animate-[pulse_3s_ease-in-out_infinite]" />
                  <div className="absolute inset-0 rounded-full border border-[var(--luxury-gold)]/10 animate-[pulse_3s_ease-in-out_infinite_reverse]" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-2xl">
            <p className="font-normal uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">
              Page Not Found
            </p>

            <h1 className="mt-5 text-4xl font-normal leading-[1.1] [font-family:var(--font-serif)] sm:text-6xl md:text-7xl">
              {cms.not_found_title ? (
                cms.not_found_title
              ) : (
                <>
                  The scent you&apos;ve <br className="hidden sm:block" /> been searching for <br /> has evaporated.
                </>
              )}
            </h1>

            <p className="mt-8 max-w-xl text-base leading-8 text-[var(--luxury-muted-strong)] md:text-lg">
              {cms.not_found_description || "Perhaps the fragrance house has moved to a new location, or the page has drifted into the mist. Our private collection awaits your return."}
            </p>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex justify-center rounded-full bg-[var(--luxury-ink)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition-all duration-300 hover:bg-[var(--luxury-moss)] hover:shadow-[0_18px_38px_rgba(22,18,13,0.16)] hover:scale-[1.02]"
              >
                Return Home
              </Link>
              <Link
                href="/products"
                className="inline-flex justify-center rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-ink)] shadow-[0_8px_20px_rgba(22,18,13,0.08)] transition-all duration-300 hover:border-[var(--luxury-gold)] hover:bg-[#fffaf2] hover:shadow-[0_12px_30px_rgba(22,18,13,0.12)] hover:scale-[1.02]"
              >
                Browse Collection
              </Link>
            </div>
          </div>

          {/* Footer Element */}
          <div className="mt-20 flex flex-col items-center gap-4 text-xs text-[var(--luxury-muted-strong)] sm:flex-row sm:justify-between sm:text-sm">
            <p>Private Fragrance House © {new Date().getFullYear()}</p>
            <p className="hidden sm:block">luxury commerce experience</p>
          </div>
        </div>
      </section>
    </main>
  );
}
