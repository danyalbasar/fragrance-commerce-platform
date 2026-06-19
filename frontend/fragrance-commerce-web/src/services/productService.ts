import { api } from "./api";
import type { Product } from "@/types/product";

export const productService = {
    async getAll(): Promise<Product[]> {
        const response = await api.get<Product[]>("/products");
        return response.data;
    },

    async getById(id: string): Promise<Product> {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },
};

export async function addToCart(
    productVariantId: string,
    quantity: number = 1
) {
    const response = await fetch(
        "http://localhost:5203/api/Cart/items",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productVariantId,
                quantity,
            }),
        }
    );

    return response.json();
}