export function AddressFormSkeleton() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 border-b border-[#d8c8ad] pb-6">
          <div className="h-10 w-48 animate-pulse rounded bg-[#e5d9c4]" />
        </div>

        <div className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-12 animate-pulse rounded bg-[#e5d9c4] ${i === 2 || i === 3 ? "md:col-span-2" : ""}`}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-[#e5d9c4]" />
            <div className="h-4 w-40 animate-pulse rounded bg-[#e5d9c4]" />
          </div>

          <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-[#e5d9c4]" />
        </div>
      </div>
    </main>
  );
}
