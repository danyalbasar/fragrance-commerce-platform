import { api } from "./api";
import type { Cart } from "@/types/cart";

function notifyCartUpdated() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cartUpdated"));
    }
}

export async function getCart(): Promise<Cart> {
    const response = await api.get<Cart>("/Cart");
    return response.data;
}

export async function addToCart(
    productVariantId: string,
    quantity: number
): Promise<Cart> {
    const response = await api.post<Cart>("/Cart/items", {
        productVariantId,
        quantity,
    });

    notifyCartUpdated();

    return response.data;
}

export async function updateCartItem(
    cartItemId: string,
    quantity: number
): Promise<Cart> {
    const response = await api.put<Cart>(`/Cart/items/${cartItemId}`, {
        quantity,
    });

    notifyCartUpdated();

    return response.data;
}

export async function removeCartItem(
    cartItemId: string
): Promise<void> {
    await api.delete(`/Cart/items/${cartItemId}`);

    notifyCartUpdated();
}

export async function applyCoupon(couponCode: string): Promise<Cart> {
    const response = await api.post<Cart>("/Cart/apply-coupon", {
        couponCode,
    });

    notifyCartUpdated();

    return response.data;
}

export async function removeCoupon(): Promise<Cart> {
    const response = await api.delete<Cart>("/Cart/remove-coupon");

    notifyCartUpdated();

    return response.data;
}