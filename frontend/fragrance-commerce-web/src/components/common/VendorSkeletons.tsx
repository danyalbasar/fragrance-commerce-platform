const bar = "animate-pulse rounded bg-[#e5d9c4]";
const border = "border border-[#d8c8ad] bg-[var(--luxury-paper)]";

export function VendorDashboardSkeleton() {
    return (
        <div className="space-y-8" aria-hidden="true">
            <div>
                <div className={`h-3 w-32 ${bar}`} />
                <div className={`mt-3 h-10 w-56 ${bar}`} />
            </div>

            <div className={`${border} p-6 shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                <div className={`h-6 w-36 ${bar}`} />
                <div className="mt-5 flex flex-wrap gap-3">
                    <div className={`h-10 w-32 rounded-full ${bar}`} />
                    <div className={`h-10 w-36 rounded-full ${bar}`} />
                    <div className={`h-10 w-32 rounded-full ${bar}`} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`${border} p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6`}>
                        <div className={`mb-4 h-10 w-10 rounded-full ${bar}`} />
                        <div className={`h-3 w-20 ${bar}`} />
                        <div className={`mt-2 h-7 w-28 ${bar}`} />
                    </div>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                <div className={`${border} p-6 shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                    <div className={`h-6 w-32 ${bar}`} />
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`border border-[#d8c8ad] bg-[var(--luxury-sand)] p-3 text-center`}>
                                <div className={`mx-auto h-7 w-12 ${bar}`} />
                                <div className={`mx-auto mt-1 h-2.5 w-14 ${bar}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`${border} p-6 shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                    <div className={`h-6 w-32 ${bar}`} />
                    <div className="mt-5 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 border-b border-[#d8c8ad] pb-3 last:border-0 last:pb-0">
                                <div className={`h-12 w-12 shrink-0 rounded ${bar}`} />
                                <div className="flex-1">
                                    <div className={`h-4 w-36 ${bar}`} />
                                    <div className={`mt-1.5 h-3 w-28 ${bar}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`${border} shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                <div className="flex items-center justify-between border-b border-[#d8c8ad] px-6 py-4">
                    <div className={`h-6 w-36 ${bar}`} />
                    <div className={`h-4 w-16 ${bar}`} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#d8c8ad] bg-[var(--luxury-sand)]">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <th key={i} className="px-6 py-3"><div className={`h-3 w-16 ${bar}`} /></th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="border-b border-[#d8c8ad] last:border-0">
                                    <td className="px-6 py-3"><div className={`h-4 w-20 ${bar}`} /></td>
                                    <td className="px-6 py-3"><div className={`h-4 w-28 ${bar}`} /></td>
                                    <td className="px-6 py-3"><div className={`h-5 w-16 rounded-full ${bar}`} /></td>
                                    <td className="px-6 py-3 text-right"><div className={`ml-auto h-4 w-16 ${bar}`} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function VendorProductsSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <div>
                <div className={`h-3 w-32 ${bar}`} />
                <div className={`mt-3 h-10 w-40 ${bar}`} />
            </div>

            <div className="flex flex-wrap gap-3">
                <div className={`h-11 w-48 rounded-full ${bar}`} />
                <div className={`h-10 w-44 ${bar}`} />
                <div className={`h-10 w-36 ${bar}`} />
                <div className={`h-10 w-32 ${bar}`} />
                <div className={`h-10 w-28 ${bar}`} />
            </div>

            <div className={`${border} shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-[#d8c8ad] bg-[var(--luxury-sand)]">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <th key={i} className="px-5 py-4"><div className={`h-3 w-16 ${bar}`} /></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="border-b border-[#d8c8ad] last:border-0">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 shrink-0 ${bar}`} />
                                        <div>
                                            <div className={`h-4 w-32 ${bar}`} />
                                            <div className={`mt-1 h-2.5 w-20 ${bar}`} />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4"><div className={`h-4 w-20 ${bar}`} /></td>
                                <td className="px-5 py-4"><div className={`h-4 w-16 ${bar}`} /></td>
                                <td className="px-5 py-4"><div className={`h-4 w-12 ${bar}`} /></td>
                                <td className="px-5 py-4"><div className={`h-5 w-16 rounded-full ${bar}`} /></td>
                                <td className="px-5 py-4"><div className={`h-8 w-8 rounded-full ${bar}`} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function VendorOrdersSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <div>
                <div className={`h-3 w-32 ${bar}`} />
                <div className={`mt-3 h-10 w-32 ${bar}`} />
                <div className={`mt-2 h-4 w-24 ${bar}`} />
            </div>

            <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-9 w-24 rounded-full ${bar}`} />
                ))}
            </div>

            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`${border} p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className={`h-5 w-24 ${bar}`} />
                                <div className={`mt-2 h-3 w-32 ${bar}`} />
                                <div className={`mt-1.5 h-3 w-20 ${bar}`} />
                            </div>
                            <div className="text-right">
                                <div className={`h-5 w-16 ${bar}`} />
                                <div className={`mt-2 h-5 w-20 rounded-full ${bar}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function VendorOrderDetailSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <div className={`h-4 w-28 ${bar}`} />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className={`h-3 w-28 ${bar}`} />
                    <div className={`mt-3 h-10 w-36 ${bar}`} />
                    <div className={`mt-2 h-4 w-48 ${bar}`} />
                </div>
                <div className={`h-6 w-20 rounded-full ${bar}`} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={`${border} p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                        <div className={`h-3 w-32 ${bar}`} />
                        <div className="mt-3 space-y-2">
                            <div className={`h-4 w-36 ${bar}`} />
                            <div className={`h-3 w-48 ${bar}`} />
                            <div className={`h-3 w-40 ${bar}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className={`${border} shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                <div className="border-b border-[#d8c8ad] px-5 py-4">
                    <div className={`h-3 w-16 ${bar}`} />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-[#d8c8ad] px-5 py-4 last:border-0">
                        <div className={`h-14 w-14 shrink-0 ${bar}`} />
                        <div className="flex-1">
                            <div className={`h-4 w-40 ${bar}`} />
                            <div className={`mt-1 h-3 w-32 ${bar}`} />
                        </div>
                        <div className={`h-4 w-16 ${bar}`} />
                    </div>
                ))}
            </div>

            <div className={`${border} p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                <div className="space-y-3">
                    <div className="flex justify-between"><div className={`h-3 w-20 ${bar}`} /><div className={`h-3 w-16 ${bar}`} /></div>
                    <div className="flex justify-between"><div className={`h-3 w-16 ${bar}`} /><div className={`h-3 w-16 ${bar}`} /></div>
                    <div className="flex justify-between border-t border-[#d8c8ad] pt-3"><div className={`h-4 w-12 ${bar}`} /><div className={`h-4 w-20 ${bar}`} /></div>
                </div>
            </div>
        </div>
    );
}

export function VendorSettingsSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <div>
                <div className={`h-3 w-32 ${bar}`} />
                <div className={`mt-3 h-10 w-36 ${bar}`} />
            </div>

            <div className={`${border} max-w-3xl p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-8`}>
                <div className={`mb-6 h-12 w-12 rounded-full ${bar}`} />
                <div className={`h-3 w-28 ${bar}`} />
                <div className={`mt-3 h-8 w-44 ${bar}`} />

                <div className="mt-7 space-y-5">
                    <div>
                        <div className={`h-3 w-24 ${bar}`} />
                        <div className={`mt-2 h-11 w-full ${bar}`} />
                    </div>
                    <div>
                        <div className={`h-3 w-24 ${bar}`} />
                        <div className={`mt-2 h-11 w-full ${bar}`} />
                    </div>
                    <div>
                        <div className={`h-3 w-16 ${bar}`} />
                        <div className={`mt-2 h-24 w-full ${bar}`} />
                    </div>
                    <div className={`h-12 w-36 rounded-full ${bar}`} />
                </div>
            </div>
        </div>
    );
}

export function VendorMessagesSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <div>
                <div className={`h-3 w-32 ${bar}`} />
                <div className={`mt-3 h-10 w-48 ${bar}`} />
                <div className={`mt-2 h-4 w-40 ${bar}`} />
            </div>

            <div className="flex gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={`h-9 w-24 rounded-full ${bar}`} />
                ))}
            </div>

            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`${border} p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)]`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className={`h-5 w-32 ${bar}`} />
                                <div className={`mt-2 h-3 w-48 ${bar}`} />
                                <div className={`mt-2 h-3 w-40 ${bar}`} />
                            </div>
                            <div className="text-right">
                                <div className={`h-5 w-16 rounded-full ${bar}`} />
                                <div className={`mt-2 h-5 w-20 ${bar}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
