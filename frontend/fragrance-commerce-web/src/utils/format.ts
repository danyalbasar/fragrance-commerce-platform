const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export function formatPrice(value: number | undefined | null): string {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return "₹0";
    }

    return inrFormatter.format(value);
}
