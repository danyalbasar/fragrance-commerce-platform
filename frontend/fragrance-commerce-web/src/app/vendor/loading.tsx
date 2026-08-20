export default function Loading() {
    return (
        <div className="space-y-6">
            <div>
                <div className="h-3 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                <div className="mt-3 h-10 w-48 animate-pulse rounded bg-[#e5d9c4]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                        <div className="mb-4 h-10 w-10 animate-pulse rounded-full border border-[#d8c8ad] bg-[var(--luxury-sand)]" />
                        <div className="h-3 w-16 animate-pulse rounded bg-[#e5d9c4]" />
                        <div className="mt-2 h-6 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                    </div>
                ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                <div className="h-64 border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]" />
                <div className="h-64 border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]" />
            </div>
        </div>
    );
}
