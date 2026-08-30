import { api } from "./api";

export interface RazorpayOrderDto {
    keyId: string;
    orderId: string;
    amountPaise: number;
    currency: string;
    orderNumber: string;
}

export interface VerifyRazorpayPaymentRequest {
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    signature: string;
}

export async function createRazorpayOrder(
    paymentId: string
): Promise<RazorpayOrderDto> {
    const response = await api.post<RazorpayOrderDto>(
        `/Payments/${paymentId}/razorpay/order`
    );

    return response.data;
}

export async function verifyRazorpayPayment(
    request: VerifyRazorpayPaymentRequest
): Promise<void> {
    await api.post("/Payments/razorpay/verify", request);
}