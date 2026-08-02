import { api } from "./api";
import type {
    Product,
    ProductImage,
    ProductSearchParams,
    ProductVariant,
    ProductVariantImage,
} from "@/types/product";
import type { PagedResult } from "@/types/common";

export interface CreateProductRequest {
    brandId: string;
    categoryId: string;
    gender: "Men" | "Women" | "Unisex";
    name: string;
    description?: string;
    variants: Array<{
        variantName: string;
        sku: string;
        mrp: number;
        sellingPrice: number;
        costPrice: number;
        stockQuantity: number;
        images: Array<{
            imageUrl: string;
            displayOrder: number;
            isPrimary: boolean;
        }>;
    }>;
    images: Array<{
        imageUrl: string;
        displayOrder: number;
        isPrimary: boolean;
    }>;
}

export interface UpdateProductRequest {
    brandId: string;
    categoryId: string;
    gender: "Men" | "Women" | "Unisex";
    name: string;
    description?: string;
    isActive: boolean;
}

export interface UpdateProductVariantRequest {
    variantName: string;
    sku: string;
    mrp: number;
    sellingPrice: number;
    costPrice: number;
    stockQuantity: number;
    isActive: boolean;
}

export interface UpdateImageMetadataRequest {
    displayOrder: number;
    isPrimary: boolean;
}

export const productService = {
    async getAll(): Promise<Product[]> {
        const response = await api.get<Product[]>("/products");
        return response.data;
    },

    async getById(id: string): Promise<Product> {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    async getVendorProducts(): Promise<Product[]> {
        const response = await api.get<Product[]>("/products/vendor");
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

    async create(request: CreateProductRequest): Promise<Product> {
        const response = await api.post<Product>("/products", request);
        return response.data;
    },

    async update(
        id: string,
        request: UpdateProductRequest
    ): Promise<void> {
        await api.put(`/products/${id}`, request);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/products/${id}`);
    },

    async updateStock(
        variantId: string,
        stockQuantity: number
    ): Promise<ProductVariant> {
        const response = await api.put<ProductVariant>(
            `/products/variants/${variantId}/stock`,
            { stockQuantity }
        );

        return response.data;
    },

    async updateVariant(
        variantId: string,
        request: UpdateProductVariantRequest
    ): Promise<ProductVariant> {
        const response = await api.put<ProductVariant>(
            `/products/variants/${variantId}`,
            request
        );

        return response.data;
    },

    async updateProductImage(
        imageId: string,
        request: UpdateImageMetadataRequest
    ): Promise<ProductImage> {
        const response = await api.put<ProductImage>(
            `/products/images/${imageId}`,
            request
        );

        return response.data;
    },

    async updateVariantImage(
        imageId: string,
        request: UpdateImageMetadataRequest
    ): Promise<ProductVariantImage> {
        const response = await api.put<ProductVariantImage>(
            `/products/variants/images/${imageId}`,
            request
        );

        return response.data;
    },

    async addProductImage(
        productId: string,
        file: File,
        isPrimary: boolean,
        displayOrder: number
    ): Promise<ProductImage> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("isPrimary", String(isPrimary));
        formData.append("displayOrder", String(displayOrder));

        const response = await api.post<ProductImage>(
            `/products/${productId}/images`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        return response.data;
    },

    async addVariantImage(
        variantId: string,
        file: File,
        isPrimary: boolean,
        displayOrder: number
    ): Promise<ProductVariantImage> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("isPrimary", String(isPrimary));
        formData.append("displayOrder", String(displayOrder));

        const response = await api.post<ProductVariantImage>(
            `/products/variants/${variantId}/images`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        return response.data;
    },
};
