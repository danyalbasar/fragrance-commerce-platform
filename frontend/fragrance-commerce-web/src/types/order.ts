export interface CreateOrderRequest {
    addressId: string;
    paymentMethod: string;
}

export interface OrderAddress {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface OrderPayment {
    id: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    transactionId: string | null;
    paidAt: string | null;
}

export interface OrderItem {
    id: string;
    productVariantId: string;
    productName: string;
    variantName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    status: string;
    orderedAt: string;
    totalAmount: number;
    couponCode: string | null;
    discountAmount: number;
    finalAmount: number;
    shippingAddress: OrderAddress;
    payment: OrderPayment;
    items: OrderItem[];
}