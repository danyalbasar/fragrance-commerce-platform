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

            <p className="sr-only">Current status: {currentStatus}</p>

            <div className="flex items-center justify-between">
                {statuses.map((status, index) => {
                    const completed =
                        currentIndex >= index;
                    const isCurrent = status === currentStatus;

                    return (
                        <div
                            key={status}
                            className="flex flex-1 items-center"
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    aria-hidden="true"
                                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold sm:h-10 sm:w-10 ${completed
                                            ? "bg-[var(--luxury-gold)] text-[var(--luxury-ink)]"
                                            : "bg-[#efe3d0] text-[var(--luxury-muted-strong)]"
                                        }`}
                                >
                                    {index + 1}
                                </div>

                                <span
                                    aria-current={isCurrent ? "step" : undefined}
                                    className={`mt-2 text-center text-[10px] font-semibold uppercase tracking-wide sm:text-sm sm:tracking-normal ${isCurrent
                                            ? "text-[var(--luxury-ink)]"
                                            : "text-[var(--luxury-muted-strong)]"
                                        }`}
                                >
                                    {status}
                                </span>
                            </div>

                            {index < statuses.length - 1 && (
                                <div
                                    aria-hidden="true"
                                    className={`mx-1 h-1 flex-1 sm:mx-2 ${currentIndex > index
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
