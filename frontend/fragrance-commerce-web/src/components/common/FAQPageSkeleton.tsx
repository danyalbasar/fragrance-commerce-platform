export function FAQPageSkeleton() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] px-6 py-14 text-[var(--luxury-ink)] md:px-10 md:py-20">
      <section className="mx-auto max-w-5xl">
        <div className="h-4 w-20 animate-pulse rounded bg-[#e5d9c4]" />

        <div className="mt-5 h-14 w-96 max-w-full animate-pulse rounded bg-[#e5d9c4]" />

        <div className="mt-6 h-4 w-3/4 animate-pulse rounded bg-[#e5d9c4]" />

        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#e5d9c4]" />

        <div className="mt-14 border-t border-[#d8c8ad]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid gap-6 py-12 md:grid-cols-[0.38fr_1fr] md:gap-10">
              <div className="h-8 w-40 animate-pulse rounded bg-[#e5d9c4]" />

              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-4 w-10/12 animate-pulse rounded bg-[#e5d9c4]" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-[var(--luxury-ink)] p-10 text-[var(--luxury-paper)]">
          <div className="h-4 w-24 animate-pulse rounded bg-[#d1ab67]" />

          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-white/25" />

          <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-white/25" />

          <div className="mt-8 h-12 w-40 animate-pulse rounded bg-[#d1ab67]" />
        </div>
      </section>
    </main>
  );
}
