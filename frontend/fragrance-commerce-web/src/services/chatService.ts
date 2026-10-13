import { api, getApiResponse } from "./api";

export interface ChatReply {
    reply: string;
    source: "open-model" | "reviewed-reference";
    experimental: boolean;
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
};

export function chatErrorMessage(error: unknown): string {
    const response = getApiResponse(error);
    if (response?.status === 429 && typeof response.data === "object" && response.data !== null &&
        "code" in response.data && response.data.code === "daily-quota") {
        return "The assistant's free daily allowance has been used. Please try again after 00:00 UTC (5:30 AM India time). You can still browse products.";
    }
    if (response?.status === 429) return "The assistant is busy. Please wait a moment and try again.";
    if (response?.status === 422) return "Try a shorter question for this small learning model.";
    if (response?.status === 503) return "The assistant is unavailable. You can still browse products or contact us.";
    return "We couldn't send your question. Please try again.";
}
