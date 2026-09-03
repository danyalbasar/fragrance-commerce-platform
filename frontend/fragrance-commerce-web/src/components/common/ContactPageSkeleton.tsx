export function ContactPageSkeleton() {
  return (
    <main
      aria-hidden="true"
      className="min-h-screen bg-[var(--luxury-ivory)] px-6 py-14 text-[var(--luxury-ink)] md:px-10 md:py-20"
    >
      <section className="mx-auto grid max-w-6xl items-start gap-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="h-3 w-20 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-5 h-14 w-48 max-w-full animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-6 h-4 w-3/4 animate-pulse rounded bg-[#e5d9c4]" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-12 grid gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5">
                <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="flex-1">
                  <div className="h-2.5 w-12 animate-pulse rounded bg-[#e5d9c4]" />
                  <div className="mt-3 h-4 w-40 animate-pulse rounded bg-[#e5d9c4]" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-[#d8c8ad] pt-8">
            <div className="h-2.5 w-24 animate-pulse rounded bg-[#e5d9c4]" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-[#e5d9c4]" />
          </div>
        </div>

        <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_22px_70px_rgba(22,18,13,0.08)] md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="mb-2 h-2.5 w-16 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-12 w-full animate-pulse rounded bg-[#e5d9c4]" />
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="mb-2 h-2.5 w-16 animate-pulse rounded bg-[#e5d9c4]" />
            <div className="h-[168px] w-full animate-pulse rounded bg-[#e5d9c4]" />
          </div>
          <div className="mt-6 h-12 w-full animate-pulse rounded bg-[#e5d9c4]" />
        </div>
      </section>
    </main>
  );
}
