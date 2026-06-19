export interface CartItem {
    id: string;
    productVariantId: string;
    productName: string;
    variantName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    imageUrl: string | null;
}

export interface Cart {
    id: string;
    couponCode: string | null;
    items: CartItem[];
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
}