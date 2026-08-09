export function OrdersPageSkeleton() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-[#d8c8ad] pb-6">
          <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-3 h-10 w-48 animate-pulse rounded bg-[#e5d9c4]" />
        </div>

        <div className="space-y-6">
          {Array.from({ length: 1 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)]"
            >
              <div className="grid gap-4 border-b border-[#d8c8ad] bg-[#efe3d0] px-6 py-4 md:grid-cols-4">
                <div>
                  <div className="h-3 w-16 animate-pulse rounded bg-[#e5d9c4]" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                </div>

                <div>
                  <div className="h-3 w-10 animate-pulse rounded bg-[#e5d9c4]" />
                  <div className="mt-2 h-4 w-20 animate-pulse rounded bg-[#e5d9c4]" />
                </div>

                <div>
                  <div className="h-3 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                  <div className="mt-2 h-4 w-20 animate-pulse rounded bg-[#e5d9c4]" />
                </div>

                <div className="flex items-start justify-start md:justify-end">
                  <div className="h-7 w-20 animate-pulse rounded-full bg-[#e5d9c4]" />
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-5">
                  {Array.from({ length: 1 }).map((_, j) => (
                    <div
                      key={j}
                      className="grid gap-5 border-b border-[#d8c8ad] pb-5 last:border-b-0 last:pb-0 md:grid-cols-[110px_1fr_220px]"
                    >
                      <div className="relative h-28 overflow-hidden rounded-[var(--luxury-radius)] bg-[var(--luxury-sand)]">
                        <div className="h-full w-full animate-pulse bg-[#e5d9c4]" />
                      </div>

                      <div>
                        <div className="h-3 w-20 animate-pulse rounded bg-[#e5d9c4]" />
                        <div className="mt-2 h-6 w-40 animate-pulse rounded bg-[#e5d9c4]" />
                        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-[#e5d9c4]" />
                        <div className="mt-2 h-4 w-16 animate-pulse rounded bg-[#e5d9c4]" />
                      </div>

                      <div className="flex items-end md:justify-end">
                        <div className="h-10 w-40 animate-pulse rounded-full bg-[#e5d9c4]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
