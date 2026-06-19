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
            <h2 className="mb-4 text-lg font-semibold">
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
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-500"
                                        }`}
                                >
                                    {index + 1}
                                </div>

                                <span className="mt-2 text-sm">
                                    {status}
                                </span>
                            </div>

                            {index < statuses.length - 1 && (
                                <div
                                    className={`mx-2 h-1 flex-1 ${currentIndex > index
                                            ? "bg-green-500"
                                            : "bg-gray-200"
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