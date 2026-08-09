export function ProductReviewsSkeleton() {
  return (
    <section
      id="reviews"
      className="mx-auto mt-12 max-w-[1600px] border-t border-[#d8c8ad] pt-12 text-[var(--luxury-ink)]"
    >
      <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="h-3 w-36 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-3 h-12 w-40 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-3 h-4 w-64 animate-pulse rounded bg-[#e5d9c4]" />
        </div>

        <div className="h-12 w-44 animate-pulse rounded-full bg-[#e5d9c4]" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-16 animate-pulse rounded bg-[#e5d9c4]" />

            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-6 animate-pulse rounded bg-[#e5d9c4]"
                />
              ))}
            </div>
          </div>

          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[52px_1fr_36px] items-center gap-3"
              >
                <div className="h-4 w-10 animate-pulse rounded bg-[#e5d9c4]" />

                <div className="h-1.5 animate-pulse rounded-full bg-[#e5d9c4]" />

                <div className="h-4 w-4 animate-pulse rounded bg-[#e5d9c4]" />
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div className="mb-5 border-b border-[#d8c8ad] pb-4">
            <div className="h-4 w-44 animate-pulse rounded bg-[#e5d9c4]" />

            <div className="mt-3 h-11 w-44 animate-pulse rounded-full bg-[#e5d9c4]" />
          </div>

          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="h-11 w-11 animate-pulse rounded-full bg-[#e5d9c4]" />

                    <div>
                      <div className="h-4 w-28 animate-pulse rounded bg-[#e5d9c4]" />

                      <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <div
                        key={star}
                        className="h-4 w-4 animate-pulse rounded bg-[#e5d9c4]"
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4 pl-0 md:pl-[56px]">
                  <div className="h-5 w-40 animate-pulse rounded bg-[#e5d9c4]" />

                  <div className="mt-2 h-4 w-full animate-pulse rounded bg-[#e5d9c4]" />

                  <div className="mt-1.5 h-4 w-3/4 animate-pulse rounded bg-[#e5d9c4]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
