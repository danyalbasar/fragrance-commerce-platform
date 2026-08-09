export function CheckoutPageSkeleton() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-[#d8c8ad] pb-6">
          <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-3 h-10 w-64 animate-pulse rounded bg-[#e5d9c4]" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#d8c8ad] bg-[#efe3d0] px-4 py-4 sm:px-6">
                <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
              </div>

              <div className="space-y-4 p-4 sm:p-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] p-4 sm:gap-4 sm:p-5"
                  >
                    <div className="mt-1 h-4 w-4 shrink-0 animate-pulse rounded-full bg-[#e5d9c4]" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-28 animate-pulse rounded bg-[#e5d9c4]" />
                        <div className="ml-auto h-4 w-10 animate-pulse rounded bg-[#e5d9c4]" />
                      </div>

                      <div className="mt-2 h-3 w-48 animate-pulse rounded bg-[#e5d9c4]" />
                      <div className="mt-1 h-3 w-40 animate-pulse rounded bg-[#e5d9c4]" />
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-4 border-t border-[#d8c8ad] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />

                  <div className="h-12 w-full animate-pulse rounded-full bg-[#e5d9c4] sm:w-56" />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-[var(--luxury-shadow-sm)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#d8c8ad] bg-[#efe3d0] px-4 py-4 sm:px-6">
                <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
              </div>

              <div className="grid gap-3 p-4 sm:p-6 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] p-4"
                  >
                    <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                  </div>
                ))}
              </div>

              <div className="px-4 pb-6 sm:px-6">
                <div className="h-12 w-full animate-pulse rounded-full bg-[#e5d9c4] sm:w-56" />
              </div>
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

              <div className="flex justify-between py-5 text-xl font-semibold">
                <div className="h-6 w-32 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="h-6 w-24 animate-pulse rounded bg-[#e5d9c4]" />
              </div>
            </div>

            <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-[#e5d9c4]" />
          </aside>
        </div>
      </div>
    </main>
  );
}
