export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Fragrance Commerce
        </p>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-neutral-950 md:text-7xl">
          Your signature fragrance store.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
          A modern ecommerce platform for perfumes, cosmetics, and
          multi-vendor online stores.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/products"
            className="rounded-full bg-neutral-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Browse Products
          </a>

          <a
            href="/vendor"
            className="rounded-full border border-neutral-300 px-8 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-white"
          >
            Vendor Dashboard
          </a>
        </div>
      </section>
    </main>
  );
}