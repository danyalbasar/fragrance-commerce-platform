export function ProductListingSkeleton() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] text-[var(--luxury-ink)]">
      <section className="relative h-[300px] overflow-hidden sm:h-[380px] md:h-[500px]">
        <div className="h-full w-full animate-pulse bg-[#e5d9c4]" />
      </section>

      <section className="px-4 py-8 sm:px-6 md:py-10">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-8 border-b border-[#d8c8ad] pb-6">
            <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />

            <div className="mt-3 h-10 w-64 animate-pulse rounded bg-[#e5d9c4]" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex h-full flex-col overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)]"
              >
                <div className="relative aspect-square overflow-hidden bg-[var(--luxury-sand)]">
                  <div className="absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--luxury-gold),transparent)]" />
                  <div className="absolute right-3 top-3 z-10 rounded-full border border-[var(--luxury-line)] bg-[rgba(255,250,242,0.9)] p-2.5 sm:right-4 sm:top-4">
                    <div className="h-5 w-5 animate-pulse rounded bg-[#e5d9c4]" />
                  </div>

                  <div className="h-full w-full animate-pulse bg-[#e5d9c4]" />

                  <div className="pointer-events-none absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-5">
                    <div className="pointer-events-auto mx-auto flex h-11 w-full max-w-[300px] items-center justify-center rounded-[var(--luxury-radius)] bg-[var(--luxury-paper)] shadow-[0_16px_35px_rgba(22,18,13,0.16)]">
                      <div className="h-4 w-20 animate-pulse rounded bg-[#e5d9c4]" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="h-3 w-16 animate-pulse rounded bg-[#e5d9c4]" />

                  <div className="mt-2 h-6 w-40 animate-pulse rounded bg-[#e5d9c4]" />

                  <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />

                  <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#e5d9c4]" />

                  <div className="mt-auto pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="h-6 w-24 animate-pulse rounded bg-[#e5d9c4]" />

                      <div className="h-5 w-20 animate-pulse rounded bg-[#e5d9c4]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}