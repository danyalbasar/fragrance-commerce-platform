import type { Order } from "@/types/order";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "@/services/paymentService";
import { openRazorpayCheckout } from "./razorpay";

export function canPayNow(order: Order): boolean {
    return (
        order.status === "Pending" &&
        order.payment.paymentMethod !== "CashOnDelivery" &&
        (order.payment.paymentStatus === "Pending" ||
            order.payment.paymentStatus === "Failed")
    );
}

export async function payOrderPayment(
    order: Order
): Promise<{ paid: boolean }> {
    const razorpayOrder = await createRazorpayOrder(order.payment.id);

    const payment = await openRazorpayCheckout({
        key:
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
            razorpayOrder.keyId,
        amountPaise: razorpayOrder.amountPaise,
        currency: razorpayOrder.currency,
        orderId: razorpayOrder.orderId,
        name: "Fragrance Commerce",
        description: `Order ${razorpayOrder.orderNumber}`,
    });

    if (!payment) return { paid: false };

    await verifyRazorpayPayment({
        paymentId: order.payment.id,
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        signature: payment.razorpay_signature,
    });

    return { paid: true };
}