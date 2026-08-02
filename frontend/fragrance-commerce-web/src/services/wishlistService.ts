import { api } from "./api";
import type { Wishlist } from "@/types/wishlist";

function notifyWishlistUpdated() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("wishlistUpdated"));
    }
}

export async function getWishlist(): Promise<Wishlist> {
    const response = await api.get<Wishlist>("/Wishlist");
    return response.data;
}

export async function addToWishlist(productId: string): Promise<void> {
    await api.post(`/Wishlist/${productId}`);
    notifyWishlistUpdated();
}

export async function removeFromWishlist(productId: string): Promise<void> {
    await api.delete(`/Wishlist/${productId}`);
    notifyWishlistUpdated();
}