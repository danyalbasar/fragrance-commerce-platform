export function LoginPageSkeleton() {
  return (
    <main aria-hidden="true" className="relative flex min-h-[calc(100svh-65px)] items-start justify-center overflow-hidden bg-[var(--luxury-ivory)] p-4 pt-8 text-[var(--luxury-ink)] sm:p-6 sm:pt-10 lg:min-h-screen lg:items-center lg:pt-6">
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,#efe3d0,rgba(239,227,208,0))] sm:h-48" />

      <section className="relative grid w-full max-w-5xl overflow-hidden border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_24px_70px_rgba(22,18,13,0.12)] lg:grid-cols-[0.9fr_1fr]">
        <div className="hidden bg-[var(--luxury-ink)] p-10 text-[var(--luxury-paper)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="h-4 w-48 animate-pulse rounded bg-white/20" />

            <div className="mt-5 h-10 w-96 max-w-full animate-pulse rounded bg-white/20" />
          </div>

          <div className="max-w-sm">
            <div className="h-4 w-full animate-pulse rounded bg-white/20" />
            <div className="mt-3 h-4 w-11/12 animate-pulse rounded bg-white/20" />
            <div className="mt-3 h-4 w-10/12 animate-pulse rounded bg-white/20" />
          </div>
        </div>

        <form className="w-full p-5 sm:p-8 md:p-10">
          <div className="h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-3 h-10 w-40 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-[#e5d9c4]" />

          <div className="mt-7">
            <div className="h-4 w-12 animate-pulse rounded bg-[#e5d9c4]" />
            <div className="mt-2 h-12 w-full animate-pulse rounded bg-[#e5d9c4]" />
          </div>

          <div className="mt-5">
            <div className="h-4 w-16 animate-pulse rounded bg-[#e5d9c4]" />
            <div className="mt-2 h-12 w-full animate-pulse rounded bg-[#e5d9c4]" />
          </div>

          <div className="mt-7 h-12 w-full animate-pulse rounded-full bg-[#e5d9c4]" />
        </form>
      </section>
    </main>
  );
}
