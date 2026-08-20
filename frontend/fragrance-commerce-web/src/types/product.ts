export type ProductGender = "Men" | "Women" | "Unisex";

export type ProductStatus = "Draft" | "Active" | "Deactivated";

export interface ProductImage {
    id: string;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
}

export interface ProductVariantImage {
    id: string;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
}

export interface ProductVariant {
    id: string;
    productId: string;
    variantName: string;
    sku: string;
    mrp: number;
    sellingPrice: number;
    costPrice: number;
    stockQuantity: number;
    isActive: boolean;
    images: ProductVariantImage[];
}

export interface Product {
    id: string;
    vendorId: string;
    vendorName?: string;

    brandId: string;
    brandName: string;

    categoryId: string;
    categoryName: string;

    gender: ProductGender;

    name: string;
    description?: string;
    status: ProductStatus;

    variants: ProductVariant[];
    images: ProductImage[];
}

export interface ProductSearchParams {
    search?: string;
    gender?: ProductGender;
    brandId?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: string;
    sortDirection?: string;
    pageNumber?: number;
    pageSize?: number;
}