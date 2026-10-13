import { api, getApiResponse } from "./api";

export type VendorChatPeriod = "today" | "yesterday" | "7days" | "30days" | "month" | "all";
export const vendorChatPeriods: Record<VendorChatPeriod, string> = {
    today: "Today", yesterday: "Yesterday", "7days": "Last 7 days", "30days": "Last 30 days", month: "This month", all: "All time",
};

export interface VendorChatData {
    asOfUtc: string;
    period: VendorChatPeriod;
    salesFromUtc: string | null;
    salesToUtc: string;
    deliveredItemSales: number;
    deliveredUnits: number;
    totalOrders: number;
    orderCounts: Record<string, number>;
    totalProducts: number;
    totalSkus: number;
    totalStockUnits: number;
    activeLowStockSkus: number;
    activeOutOfStockSkus: number;
    topSellers: Array<{ productId: string; productName: string; units: number; grossSales: number }>;
    lowStock: Array<{ productId: string; productName: string; variantName: string; sku: string; stock: number }>;
    matchingInventory: VendorChatData["lowStock"];
    recentOrders: Array<{ orderNumber: string; orderedAtUtc: string; status: string; vendorUnits: number; vendorItemAmount: number }>;
}

export interface ChatReply {
    reply: string;
    source: "open-model" | "reviewed-reference";
    experimental: boolean;
    vendorData?: VendorChatData;
    products: Array<{
        id: string;
        name: string;
        brandName: string;
        price: number;
        inStock: boolean;
    }>;
}

export const chatService = {
    async send(message: string, signal: AbortSignal): Promise<ChatReply> {
        const response = await api.post<ChatReply>("/chat", { message }, { signal, timeout: 100000 });
        return response.data;
    },
    async sendVendor(message: string, period: VendorChatPeriod, signal: AbortSignal): Promise<ChatReply> {
        const response = await api.post<ChatReply>("/vendor/chat", { message, period }, { signal, timeout: 100000 });
        return response.data;
    },
};

export function chatErrorMessage(error: unknown): string {
    const response = getApiResponse(error);
    if (response?.status === 401) return "Please sign in again to use your vendor assistant.";
    if (response?.status === 403) return "This assistant requires a vendor account.";
    if (response?.status === 404) return "Your vendor profile is unavailable. Check your vendor account settings.";
    if (response?.status === 429 && typeof response.data === "object" && response.data !== null &&
        "code" in response.data && response.data.code === "daily-quota") {
        return "The assistant's free daily allowance has been used. Please try again after 00:00 UTC (5:30 AM India time). You can still browse products.";
    }
    if (response?.status === 429) return "The assistant is busy. Please wait a moment and try again.";
    if (response?.status === 422) return "Try a shorter question for this small learning model.";
    if (response?.status === 503) return "The assistant is unavailable. You can still browse products or contact us.";
    return "We couldn't send your question. Please try again.";
}
