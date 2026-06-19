"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import type { Cart } from "@/types/cart";
import type { Address } from "@/types/address";
import { getCart } from "@/services/cartService";
import { getAddresses } from "@/services/addressService";
import { createOrder } from "@/services/orderService";

export default function CheckoutPage() {
    const router = useRouter();

    const [cart, setCart] = useState<Cart | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Upi");
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    async function loadCheckoutData() {
        try {
            const [cartData, addressData] = await Promise.all([
                getCart(),
                getAddresses(),
            ]);

            setCart(cartData);
            setAddresses(addressData);

            const defaultAddress =
                addressData.find((address) => address.isDefault) ?? addressData[0];

            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCheckoutData();
    }, []);

    async function handlePlaceOrder() {
        if (!selectedAddressId) {
            alert("Please select a shipping address.");
            return;
        }

        try {
            setPlacingOrder(true);

            const order = await createOrder({
                addressId: selectedAddressId,
                paymentMethod,
            });

            router.push("/orders");
        } catch (error) {
            console.error(error);
            alert("Failed to place order.");
        } finally {
            setPlacingOrder(false);
        }
    }

    if (loading) {
        return <div className="p-8 text-xl">Loading checkout...</div>;
    }

    return (
        <ProtectedRoute>
            <main className="mx-auto max-w-6xl p-8">
                <h1 className="mb-8 text-4xl font-bold">Checkout</h1>

                <div className="grid gap-8 lg:grid-cols-3">
                    <section className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border bg-white p-6">
                            <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>

                            {addresses.length === 0 ? (
                                <div>
                                    <p className="text-gray-500">
                                        No address found. Please add an address first.
                                    </p>

                                    <button
                                        onClick={() => router.push("/addresses/new")}
                                        className="mt-4 rounded-lg bg-black px-4 py-2 text-white hover:bg-neutral-800"
                                    >
                                        Add Address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((address) => (
                                        <label
                                            key={address.id}
                                            className={`block cursor-pointer rounded-lg border p-4 ${selectedAddressId === address.id
                                                ? "border-black bg-neutral-50"
                                                : "border-gray-200"
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddressId === address.id}
                                                    onChange={() => setSelectedAddressId(address.id)}
                                                    className="mt-1"
                                                />

                                                <div>
                                                    <p className="font-semibold">
                                                        {address.fullName}

                                                        {address.isDefault && (
                                                            <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                                                Default
                                                            </span>
                                                        )}
                                                    </p>

                                                    <p className="mt-2 text-sm text-gray-600">
                                                        {address.addressLine1}
                                                        {address.addressLine2 &&
                                                            `, ${address.addressLine2}`}
                                                    </p>

                                                    <p className="text-sm text-gray-600">
                                                        {address.city}, {address.state} -{" "}
                                                        {address.postalCode}
                                                    </p>

                                                    <p className="text-sm text-gray-600">
                                                        {address.country}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-600">
                                                        Phone: {address.phoneNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {!selectedAddressId && (
                                <p className="mt-3 text-sm text-red-500">
                                    Please select a shipping address.
                                </p>
                            )}
                        </div>

                        <div className="rounded-xl border bg-white p-6">
                            <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>

                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full rounded-lg border px-4 py-3"
                            >
                                <option value="Upi">UPI</option>
                                <option value="CreditCard">Credit Card</option>
                                <option value="DebitCard">Debit Card</option>
                                <option value="NetBanking">Net Banking</option>
                                <option value="Wallet">Wallet</option>
                                <option value="CashOnDelivery">Cash On Delivery</option>
                            </select>
                        </div>
                    </section>

                    <aside className="rounded-xl border bg-white p-6">
                        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

                        <div className="space-y-3">
                            {cart?.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>
                                        {item.productName} ({item.variantName}) × {item.quantity}
                                    </span>

                                    <span>₹{item.totalPrice}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-2 border-t pt-4">
                            <div className="flex justify-between">
                                <span>Total</span>
                                <span>₹{cart?.totalAmount}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>₹{cart?.discountAmount}</span>
                            </div>

                            <div className="flex justify-between text-xl font-bold">
                                <span>Final Amount</span>
                                <span>₹{cart?.finalAmount}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={
                                placingOrder ||
                                !selectedAddressId ||
                                !cart ||
                                cart.items.length === 0
                            }
                            className="mt-6 w-full rounded-full bg-black py-3 font-semibold text-white hover:bg-neutral-800 disabled:bg-gray-400"
                        >
                            {placingOrder ? "Placing Order..." : "Place Order"}
                        </button>
                    </aside>
                </div>
            </main>
        </ProtectedRoute>
    );
}