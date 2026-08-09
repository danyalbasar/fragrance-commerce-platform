export function CartPageSkeleton() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-[#d8c8ad] pb-6">
          <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-3 h-10 w-48 animate-pulse rounded bg-[#e5d9c4]" />
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          <section>
            <div className="space-y-6 border-t border-[#d8c8ad]">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="grid gap-4 border-b border-[#d8c8ad] py-6 sm:grid-cols-[132px_1fr_auto] md:grid-cols-[170px_1fr_auto] md:gap-5"
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-[var(--luxury-radius)] bg-[var(--luxury-sand)] sm:h-32 sm:w-32 md:h-40 md:w-40">
                    <div className="h-full w-full animate-pulse bg-[#e5d9c4]" />
                  </div>

                  <div className="min-w-0">
                    <div className="h-3 w-16 animate-pulse rounded bg-[#e5d9c4]" />

                    <div className="mt-2 h-6 w-40 animate-pulse rounded bg-[#e5d9c4]" />

                    <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />

                    <div className="mt-4 h-6 w-24 animate-pulse rounded bg-[#e5d9c4]" />

                    <div className="mt-5 flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)]">
                        <div className="h-4 w-4 animate-pulse rounded bg-[#e5d9c4]" />
                      </div>

                      <div className="h-5 w-8 animate-pulse rounded bg-[#e5d9c4]" />

                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)]">
                        <div className="h-4 w-4 animate-pulse rounded bg-[#e5d9c4]" />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                    <div className="h-6 w-20 animate-pulse rounded bg-[#e5d9c4]" />

                    <div className="h-5 w-5 animate-pulse rounded bg-[#e5d9c4]" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="h-fit rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6 lg:sticky lg:top-24">
            <div className="h-8 w-40 animate-pulse rounded bg-[#e5d9c4]" />

            <div className="mt-6 border-t border-[#d8c8ad]">
              <div className="flex justify-between border-b border-[#d8c8ad] py-4">
                <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-4 w-20 animate-pulse rounded bg-[#e5d9c4]" />
              </div>

              <div className="flex justify-between border-b border-[#d8c8ad] py-4">
                <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-4 w-20 animate-pulse rounded bg-[#e5d9c4]" />
              </div>

              <div className="flex justify-between border-b border-[#d8c8ad] py-4">
                <div className="h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-4 w-20 animate-pulse rounded bg-[#e5d9c4]" />
              </div>

              <div className="flex justify-between py-5 text-xl font-semibold">
                <div className="h-6 w-32 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-6 w-24 animate-pulse rounded bg-[#e5d9c4]" />
              </div>
            </div>

            <div className="mt-6">
              <div className="h-5 w-24 animate-pulse rounded bg-[#e5d9c4]" />

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <div className="h-12 w-full animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-12 w-20 animate-pulse rounded bg-[#e5d9c4]" />
              </div>
            </div>

            <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-[#e5d9c4]" />

            <div className="mt-3 h-12 w-full animate-pulse rounded-full bg-[#e5d9c4]" />
          </aside>
        </div>
      </div>
    </main>
  );
}
