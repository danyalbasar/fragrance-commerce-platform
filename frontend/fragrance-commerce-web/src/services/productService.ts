import { api } from "./api";
import type { Product, ProductSearchParams } from "@/types/product";
import type { PagedResult } from "@/types/common";

export const productService = {
    async getAll(): Promise<Product[]> {
        const response = await api.get<Product[]>("/products");
        return response.data;
    },

    async getById(id: string): Promise<Product> {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    async search(
        params: ProductSearchParams
    ): Promise<PagedResult<Product>> {
        const response = await api.get<PagedResult<Product>>(
            "/products/search",
            { params }
        );

        return response.data;
    },
};