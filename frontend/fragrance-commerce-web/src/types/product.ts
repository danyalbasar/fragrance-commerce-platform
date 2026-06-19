export interface ProductImage {
    id: string;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
}

export interface ProductVariant {
    id: string;
    variantName: string;
    sku: string;
    mrp: number;
    sellingPrice: number;
    costPrice: number;
    stockQuantity: number;
    stockStatus: string;
    images: ProductImage[];
}

export interface Product {
    id: string;
    vendorId: string;
    vendorName: string;

    brandId: string;
    brandName: string;

    categoryId: string;
    categoryName: string;

    name: string;
    description: string;
    isActive: boolean;

    variants: ProductVariant[];
    images: ProductImage[];
}