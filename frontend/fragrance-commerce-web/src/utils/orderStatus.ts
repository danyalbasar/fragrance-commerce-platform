export function getStatusClasses(status: string) {
    const base =
        "border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] shadow-[0_8px_20px_rgba(22,18,13,0.06)]";

    switch (status) {
        case "Pending":
            return `${base} border-[#d5b36a] bg-[#fff4d8] text-[#86631d]`;

        case "Processing":
            return `${base} border-[#9cae9d] bg-[#edf3ea] text-[#435a43]`;

        case "Shipped":
            return `${base} border-[#b9a37a] bg-[#f3ead9] text-[#6b5630]`;

        case "Delivered":
            return `${base} border-[#a9b98f] bg-[#eef5e8] text-[#3f5f32]`;

        case "Cancelled":
            return `${base} border-[#d4a6a1] bg-[#fae9e6] text-[#8b3028]`;

        default:
            return `${base} border-[#d8c8ad] bg-[var(--luxury-paper)] text-[var(--luxury-muted)]`;
    }
}
