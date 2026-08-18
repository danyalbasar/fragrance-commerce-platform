export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div>
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="mt-2 h-7 w-48 rounded bg-gray-200" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="mb-4 h-9 w-9 rounded-lg bg-gray-100" />
                        <div className="h-3 w-16 rounded bg-gray-100" />
                        <div className="mt-2 h-6 w-24 rounded bg-gray-200" />
                    </div>
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <div className="h-64 rounded-xl border border-gray-200 bg-white" />
                <div className="h-64 rounded-xl border border-gray-200 bg-white" />
            </div>
        </div>
    );
}
