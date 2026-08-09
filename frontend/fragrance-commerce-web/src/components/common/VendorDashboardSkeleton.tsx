export function VendorDashboardSkeleton() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] text-[var(--luxury-ink)]">
      <div className="grid min-h-screen lg:grid-cols-[270px_1fr]">
        <aside className="border-b border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-4 sm:px-5 sm:py-6 lg:border-b-0 lg:border-r">
          <div>
            <div className="h-3 w-16 animate-pulse rounded bg-[#e5d9c4]" />

            <div className="mt-2 h-7 w-36 animate-pulse rounded bg-[#e5d9c4]" />
          </div>

          <div className="mt-6">
            <div className="flex h-11 items-center gap-3 rounded border border-[#d8c8ad] bg-[#fffaf2] px-3">
              <div className="h-4 w-4 animate-pulse rounded bg-[#e5d9c4]" />

              <div className="h-4 w-full animate-pulse rounded bg-[#e5d9c4]" />
            </div>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-7 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {["Overview", "Products", "Orders", "Profile"].map((label) => (
              <div
                key={label}
                className="flex h-11 items-center gap-3 rounded border border-[#d8c8ad] px-3"
              >
                <div className="h-4 w-4 animate-pulse rounded bg-[#e5d9c4]" />

                <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
              </div>
            ))}
          </nav>
        </aside>

        <section className="px-4 py-6 md:px-8 md:py-8">
          <header className="mb-6 border-b border-[#d8c8ad] pb-6">
            <div className="h-3 w-32 animate-pulse rounded bg-[#e5d9c4]" />

            <div className="mt-3 h-11 w-56 animate-pulse rounded bg-[#e5d9c4]" />

            <div className="mt-4 h-11 w-44 animate-pulse rounded-full bg-[#e5d9c4]" />
          </header>

          <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
            <div className="flex items-center justify-between border-b border-[#d8c8ad] px-4 py-4 sm:px-6 sm:py-5">
              <div className="h-7 w-32 animate-pulse rounded bg-[#e5d9c4]" />

              <div className="h-5 w-20 animate-pulse rounded bg-[#e5d9c4]" />
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-11 animate-pulse rounded border border-[#d8c8ad] bg-[#fffaf2]"
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <div className="h-12 w-full animate-pulse rounded-full bg-[#e5d9c4]" />

                <div className="h-12 w-36 animate-pulse rounded-full bg-[#e5d9c4]" />
              </div>
            </div>
          </div>

          <div className="mt-6 border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
            <div className="border-b border-[#d8c8ad] px-4 py-4 sm:px-6 sm:py-5">
              <div className="h-7 w-40 animate-pulse rounded bg-[#e5d9c4]" />
            </div>

            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="grid gap-4 border-b border-[#d8c8ad] p-4 last:border-b-0 sm:p-5"
              >
                <div className="h-20 w-20 animate-pulse rounded bg-[#e5d9c4]" />

                <div className="flex-1">
                  <div className="h-4 w-40 animate-pulse rounded bg-[#e5d9c4]" />

                  <div className="mt-2 h-3 w-56 animate-pulse rounded bg-[#e5d9c4]" />

                  <div className="mt-3 h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                </div>

                <div className="hidden h-10 w-16 rounded-full border border-[#d8c8ad] md:block" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
