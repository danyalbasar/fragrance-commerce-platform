import { api } from "./api";
import type { Cart } from "@/types/cart";

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

    return response.data;
}

export async function updateCartItem(
    cartItemId: string,
    quantity: number
): Promise<Cart> {
    const response = await api.put<Cart>(`/Cart/items/${cartItemId}`, {
        quantity,
    });

    return response.data;
}

export async function removeCartItem(
    cartItemId: string
): Promise<void> {
    await api.delete(`/Cart/items/${cartItemId}`);
}

export async function applyCoupon(couponCode: string): Promise<Cart> {
    const response = await api.post<Cart>("/Cart/apply-coupon", {
        couponCode,
    });

    return response.data;
}

export async function removeCoupon(): Promise<Cart> {
    const response = await api.delete<Cart>("/Cart/remove-coupon");
    return response.data;
}