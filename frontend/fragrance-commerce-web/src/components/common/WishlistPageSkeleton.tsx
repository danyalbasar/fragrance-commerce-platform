export function WishlistPageSkeleton() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-[#d8c8ad] pb-6">
          <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-3 h-10 w-48 animate-pulse rounded bg-[#e5d9c4]" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex h-full flex-col overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[var(--luxury-sand)]">
                <div className="absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--luxury-gold),transparent)]" />

                <div className="h-full w-full animate-pulse bg-[#e5d9c4]" />
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="h-3 w-16 animate-pulse rounded bg-[#e5d9c4]" />

                <div className="mt-2 h-6 w-40 animate-pulse rounded bg-[#e5d9c4]" />

                <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />

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
    </main>
  );
}
