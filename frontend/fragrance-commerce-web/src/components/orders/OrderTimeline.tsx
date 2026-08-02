interface Props {
    currentStatus: string;
}

const statuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
];

export default function OrderTimeline({
    currentStatus,
}: Props) {
    const currentIndex = statuses.indexOf(currentStatus);

    return (
        <div className="mt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
                Order Progress
            </h2>

            <div className="flex items-center justify-between">
                {statuses.map((status, index) => {
                    const completed =
                        currentIndex >= index;

                    return (
                        <div
                            key={status}
                            className="flex flex-1 items-center"
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${completed
                                            ? "bg-[var(--luxury-gold)] text-[var(--luxury-ink)]"
                                            : "bg-[#efe3d0] text-[var(--luxury-muted)]"
                                        }`}
                                >
                                    {index + 1}
                                </div>

                                <span className="mt-2 text-sm text-[var(--luxury-muted)]">
                                    {status}
                                </span>
                            </div>

                            {index < statuses.length - 1 && (
                                <div
                                    className={`mx-2 h-1 flex-1 ${currentIndex > index
                                            ? "bg-[var(--luxury-gold)]"
                                            : "bg-[#d8c8ad]"
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
