export function PageSkeleton() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-6 text-[var(--luxury-ink)] sm:py-8 md:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 text-xs uppercase tracking-[0.12em] text-[var(--luxury-muted)] sm:mb-8 sm:text-sm sm:tracking-[0.18em]">
          <div className="h-3 w-32 animate-pulse rounded bg-[#e5d9c4]" />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[50%_1fr] lg:gap-12 xl:gap-16">
          <section className="grid items-start gap-4 md:sticky md:top-28 md:grid-cols-[90px_1fr] md:gap-5">
            <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 shrink-0 overflow-hidden border bg-[#efe3d0] transition sm:h-24 sm:w-24"
                >
                  <div className="h-full w-full animate-pulse bg-[#e5d9c4]" />
                </div>
              ))}
            </div>

            <div className="order-1 self-start overflow-hidden border border-[#d8c8ad] bg-[#efe3d0] shadow-[0_24px_70px_rgba(22,18,13,0.12)] md:order-2">
              <div className="relative h-[360px] sm:h-[480px] md:h-[580px]">
                <div className="h-full w-full animate-pulse bg-[#e5d9c4]" />
              </div>
            </div>
          </section>

          <section className="lg:pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 w-20 animate-pulse rounded bg-[#e5d9c4]" />

              <div className="h-6 w-6 animate-pulse rounded bg-[#e5d9c4]" />
            </div>

            <div className="mt-3 h-10 w-64 animate-pulse rounded bg-[#e5d9c4]" />

            <div className="mt-5 h-4 w-full animate-pulse rounded bg-[#e5d9c4]" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[#e5d9c4]" />

            <div className="mt-6">
              <div className="h-8 w-32 animate-pulse rounded bg-[#e5d9c4]" />

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <div className="h-3 w-16 animate-pulse rounded bg-[#e5d9c4]" />
              </div>
            </div>

            <div className="mt-6">
              <div className="h-6 w-24 animate-pulse rounded bg-[#e5d9c4]" />

              <div className="mt-4 flex flex-wrap gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-20 animate-pulse rounded-full bg-[#e5d9c4]"
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <div className="flex h-11 w-28 items-center justify-between rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)] px-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-[#e5d9c4]" />
                <div className="h-4 w-6 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-[#e5d9c4]" />
              </div>
            </div>

            <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-[#e5d9c4]" />

            <div className="mt-6 grid gap-3 border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 text-sm text-[var(--luxury-muted)]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-pulse rounded bg-[#e5d9c4]" />
                  <div className="h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-[#d8c8ad]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b border-[#d8c8ad]">
                  <div className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em]">
                    <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                    <div className="h-4 w-4 animate-pulse rounded bg-[#e5d9c4]" />
                  </div>
                  <div className="pb-5">
                    <div className="h-4 w-full animate-pulse rounded bg-[#e5d9c4]" />
                    <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[#e5d9c4]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}