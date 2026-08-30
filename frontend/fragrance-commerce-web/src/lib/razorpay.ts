export interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    handler: (response: RazorpayPaymentResponse) => void;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string; color_background?: string };
    modal?: { ondismiss?: () => void };
}

export interface RazorpayCheckout {
    open(): void;
    close(): void;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
    }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window !== "undefined" && window.Razorpay) {
            resolve();
            return;
        }

        const existing = document.querySelector<HTMLScriptElement>(
            'script[data-razorpay="true"]'
        );

        if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () =>
                reject(new Error("Failed to load Razorpay checkout."))
            );
            return;
        }

        const script = document.createElement("script");
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.setAttribute("data-razorpay", "true");
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
        document.head.appendChild(script);
    });
}

export async function openRazorpayCheckout(input: {
    key: string;
    amountPaise: number;
    currency: string;
    orderId: string;
    name: string;
    description?: string;
}): Promise<RazorpayPaymentResponse | null> {
    await loadRazorpayScript();

    return new Promise((resolve) => {
        const checkout = new window.Razorpay({
            key: input.key,
            amount: input.amountPaise,
            currency: input.currency,
            order_id: input.orderId,
            name: input.name,
            description: input.description,
            handler: (response) => resolve(response),
            modal: {
                ondismiss: () => resolve(null),
            },
        });

        checkout.open();
    });
}