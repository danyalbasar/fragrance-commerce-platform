export interface WishlistItem {
    id: string;
    productId: string;

    productName: string;
    brandName: string;
    categoryName: string;

    description: string;
    gender: string;

    primaryImageUrl?: string;

    variantId: string;
    variantName: string;

    sellingPrice: number;
    stockQuantity: number;
}

export interface Wishlist {
    items: WishlistItem[];
}