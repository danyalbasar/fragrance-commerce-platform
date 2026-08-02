"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import type { Cart } from "@/types/cart";
import type { Address } from "@/types/address";
import { getCart } from "@/services/cartService";
import {
    getAddresses,
    createAddress,
    updateAddress,
} from "@/services/addressService";
import { createOrder } from "@/services/orderService";

export default function CheckoutPage() {
    const router = useRouter();

    const [cart, setCart] = useState<Cart | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Upi");
    const [step, setStep] = useState<"shipping" | "payment">("shipping");
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressError, setAddressError] = useState("");

    const emptyAddressForm = {
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        phoneNumber: "",
        isDefault: false,
    };

    const [addressForm, setAddressForm] = useState(emptyAddressForm);

    async function loadCheckoutData() {
        try {
            const [cartData, addressData] = await Promise.all([
                getCart(),
                getAddresses(),
            ]);

            setCart(cartData);
            setAddresses(addressData);

            const defaultAddress =
                addressData.find((address) => address.isDefault) ??
                addressData[0];

            if (defaultAddress && !selectedAddressId) {
                setSelectedAddressId(defaultAddress.id);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCheckoutData();
    }, []);

    function openNewAddressForm() {
        setEditingAddressId(null);
        setAddressForm(emptyAddressForm);
        setAddressError("");
        setShowAddressForm(true);
    }

    function openEditAddressForm(address: Address) {
        setEditingAddressId(address.id);
        setAddressForm({
            fullName: address.fullName ?? "",
            addressLine1: address.addressLine1 ?? "",
            addressLine2: address.addressLine2 ?? "",
            city: address.city ?? "",
            state: address.state ?? "",
            postalCode: address.postalCode ?? "",
            country: address.country ?? "India",
            phoneNumber: address.phoneNumber ?? "",
            isDefault: address.isDefault ?? false,
        });
        setAddressError("");
        setShowAddressForm(true);
    }

    function isAddressValid() {
        return (
            addressForm.fullName.trim() &&
            addressForm.addressLine1.trim() &&
            addressForm.city.trim() &&
            addressForm.state.trim() &&
            addressForm.postalCode.trim() &&
            addressForm.country.trim() &&
            addressForm.phoneNumber.trim()
        );
    }

    async function handleSaveAddress() {
        if (!isAddressValid()) {
            setAddressError("Please fill all required address fields.");
            return;
        }

        if (editingAddressId) {
            await updateAddress(editingAddressId, addressForm);
            setSelectedAddressId(editingAddressId);
        } else {
            const newAddress = await createAddress(addressForm);
            setSelectedAddressId(newAddress.id);
        }

        await loadCheckoutData();
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressError("");
    }

    async function handlePlaceOrder() {
        if (!selectedAddressId) {
            alert("Please select a shipping address.");
            return;
        }

        try {
            setPlacingOrder(true);

            await createOrder({
                addressId: selectedAddressId,
                paymentMethod,
            });

            window.dispatchEvent(new Event("cartUpdated"));

            router.push("/orders");
        } catch {
            alert("Failed to place order.");
        } finally {
            setPlacingOrder(false);
        }
    }

    const paymentMethods = [
        { label: "UPI", value: "Upi" },
        { label: "Credit Card", value: "CreditCard" },
        { label: "Debit Card", value: "DebitCard" },
        { label: "Net Banking", value: "NetBanking" },
        { label: "Wallet", value: "Wallet" },
        { label: "Cash On Delivery", value: "CashOnDelivery" },
    ];

    if (loading) {
        return <div className="bg-[var(--luxury-ivory)] p-8 text-xl text-[var(--luxury-ink)]">Loading checkout...</div>;
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 border-b border-[#d8c8ad] pb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--luxury-gold)] sm:tracking-[0.34em]">
                            Secure Checkout
                        </p>

                        <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                            Checkout
                        </h1>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
                        <section className="space-y-6">
                            <div className="overflow-hidden border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                                <div className="flex items-center justify-between gap-4 border-b border-[#d8c8ad] bg-[#efe3d0] px-4 py-4 sm:px-6">
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em]">
                                        1. Shipping
                                    </h2>

                                    {step === "payment" && (
                                        <button
                                            onClick={() => setStep("shipping")}
                                            className="cursor-pointer text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-gold)] sm:tracking-[0.14em]"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="p-4 sm:p-6">
                                    {addresses.length === 0 && !showAddressForm ? (
                                        <div>
                                            <p className="text-[var(--luxury-muted)]">
                                                No address found. Please add an address first.
                                            </p>

                                            <button
                                                onClick={openNewAddressForm}
                                                className="mt-4 cursor-pointer rounded-full bg-[var(--luxury-ink)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--luxury-paper)]"
                                            >
                                                Add Address
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {addresses.map((address) => (
                                                <label
                                                    key={address.id}
                                                    className={`block cursor-pointer border p-4 transition sm:p-5 ${selectedAddressId === address.id
                                                        ? "border-[var(--luxury-gold)] bg-[#fffaf2]"
                                                        : "border-[#d8c8ad] hover:border-[var(--luxury-gold)]"
                                                        }`}
                                                >
                                                    <div className="flex gap-3 sm:gap-4">
                                                        <input
                                                            type="radio"
                                                            name="address"
                                                            checked={selectedAddressId === address.id}
                                                            onChange={() =>
                                                                setSelectedAddressId(address.id)
                                                            }
                                                            className="mt-1 cursor-pointer accent-[var(--luxury-gold)]"
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-semibold">
                                                                    {address.fullName}
                                                                </p>

                                                                {address.isDefault && (
                                                                    <span className="rounded-full border border-[#b7c7a8] bg-[#eef5e8] px-2 py-1 text-xs text-[#3f5f32]">
                                                                        Default
                                                                    </span>
                                                                )}

                                                                {step === "shipping" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            openEditAddressForm(address);
                                                                        }}
                                                                        className="ml-auto cursor-pointer text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-gold)] sm:tracking-[0.12em]"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                                                {address.addressLine1}
                                                                {address.addressLine2 &&
                                                                    `, ${address.addressLine2}`}
                                                            </p>

                                                            <p className="text-sm text-[var(--luxury-muted)]">
                                                                {address.city}, {address.state} -{" "}
                                                                {address.postalCode}
                                                            </p>

                                                            <p className="text-sm text-[var(--luxury-muted)]">
                                                                {address.country}
                                                            </p>

                                                            <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                                                Phone: {address.phoneNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}

                                            {step === "shipping" && (
                                                <div className="flex flex-col gap-4 border-t border-[#d8c8ad] pt-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <button
                                                        onClick={openNewAddressForm}
                                                        className="cursor-pointer text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-gold)] sm:tracking-[0.14em]"
                                                    >
                                                        + Add New Address
                                                    </button>

                                                    <button
                                                        onClick={() => setStep("payment")}
                                                        disabled={!selectedAddressId}
                                                        className="cursor-pointer rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] disabled:cursor-not-allowed disabled:bg-gray-400 sm:tracking-[0.14em]"
                                                    >
                                                        Continue to Payment
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {showAddressForm && step === "shipping" && (
                                        <div className="mt-5 border border-[#d8c8ad] bg-[#fffaf2] p-4 sm:p-5">
                                            <h3 className="mb-4 text-2xl font-normal [font-family:var(--font-serif)]">
                                                {editingAddressId
                                                    ? "Edit Address"
                                                    : "Add New Address"}
                                            </h3>

                                            {addressError && (
                                                <p className="mb-4 text-sm text-red-500">
                                                    {addressError}
                                                </p>
                                            )}

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <input
                                                    value={addressForm.fullName}
                                                    onChange={(e) =>
                                                        setAddressForm({
                                                            ...addressForm,
                                                            fullName: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Full Name *"
                                                    className="border border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                                                />

                                                <input
                                                    value={addressForm.phoneNumber}
                                                    onChange={(e) =>
                                                        setAddressForm({
                                                            ...addressForm,
                                                            phoneNumber: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Phone Number *"
                                                    className="border border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                                                />

                                                <input
                                                    value={addressForm.addressLine1}
                                                    onChange={(e) =>
                                                        setAddressForm({
                                                            ...addressForm,
                                                            addressLine1: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Address Line 1 *"
                                                    className="border border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)] md:col-span-2"
                                                />

                                                <input
                                                    value={addressForm.addressLine2}
                                                    onChange={(e) =>
                                                        setAddressForm({
                                                            ...addressForm,
                                                            addressLine2: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Address Line 2"
                                                    className="border border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)] md:col-span-2"
                                                />

                                                <input
                                                    value={addressForm.city}
                                                    onChange={(e) =>
                                                        setAddressForm({
                                                            ...addressForm,
                                                            city: e.target.value,
                                                        })
                                                    }
                                                    placeholder="City *"
                                                    className="border border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                                                />

                                                <input
                                                    value={addressForm.state}
                                                    onChange={(e) =>
                                                        setAddressForm({
                                                            ...addressForm,
                                                            state: e.target.value,
                                                        })
                                                    }
                                                    placeholder="State *"
                                                    className="border border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                                                />

                                                <input
                                                    value={addressForm.postalCode}
                                                    onChange={(e) =>
                                                        setAddressForm({
                                                            ...addressForm,
                                                            postalCode: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Postal Code *"
                                                    className="border border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                                                />

                                                <input
                                                    value={addressForm.country}
                                                    onChange={(e) =>
                                                        setAddressForm({
                                                            ...addressForm,
                                                            country: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Country *"
                                                    className="border border-[#d8c8ad] bg-[var(--luxury-paper)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                                                />
                                            </div>

                                            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={addressForm.isDefault}
                                                    onChange={(e) =>
                                                        setAddressForm({
                                                            ...addressForm,
                                                            isDefault: e.target.checked,
                                                        })
                                                    }
                                                    className="cursor-pointer accent-[var(--luxury-gold)]"
                                                />
                                                Set as default address
                                            </label>

                                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                                <button
                                                    onClick={handleSaveAddress}
                                                    className="cursor-pointer rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] sm:tracking-[0.14em]"
                                                >
                                                    Save Address
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setShowAddressForm(false);
                                                        setEditingAddressId(null);
                                                        setAddressError("");
                                                    }}
                                                    className="cursor-pointer rounded-full border border-[#d8c8ad] px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold)] sm:tracking-[0.14em]"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-hidden border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                                <div className="border-b border-[#d8c8ad] bg-[#efe3d0] px-4 py-4 sm:px-6">
                                    <h2
                                        className={`text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] ${step === "shipping"
                                            ? "text-[var(--luxury-muted)]"
                                            : "text-[var(--luxury-ink)]"
                                            }`}
                                    >
                                        2. Payment
                                    </h2>
                                </div>

                                {step === "payment" && (
                                    <div className="p-4 sm:p-6">
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {paymentMethods.map((method) => (
                                                <button
                                                    key={method.value}
                                                    onClick={() =>
                                                        setPaymentMethod(method.value)
                                                    }
                                                    className={`cursor-pointer border p-4 text-left transition ${paymentMethod === method.value
                                                        ? "border-[var(--luxury-gold)] bg-[#fffaf2]"
                                                        : "border-[#d8c8ad] hover:border-[var(--luxury-gold)]"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold">
                                                            {method.label}
                                                        </span>

                                                        {paymentMethod === method.value && (
                                                            <Check size={18} />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <p className="mt-6 text-sm text-[var(--luxury-muted)]">
                                            Please review your details. Your order will not be placed until you click Place Order.
                                        </p>

                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={
                                                placingOrder ||
                                                !selectedAddressId ||
                                                !cart ||
                                                cart.items.length === 0
                                            }
                                            className="mt-5 w-full cursor-pointer rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:tracking-[0.12em]"
                                        >
                                            {placingOrder
                                                ? "Placing Order..."
                                                : `Place Order • ₹${cart?.finalAmount}`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        <aside className="h-fit border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6 lg:sticky lg:top-24">
                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">Price Details</h2>

                            <div className="mt-6 border-t border-[#d8c8ad]">
                                <div className="flex justify-between border-b border-[#d8c8ad] py-4">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-semibold">
                                        ₹{cart?.totalAmount}
                                    </span>
                                </div>

                                <div className="border-b border-[#d8c8ad] py-4">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Discount</span>
                                        <span
                                            className={
                                                cart?.discountAmount &&
                                                    cart.discountAmount > 0
                                                ? "font-semibold text-[#3f5f32]"
                                                    : "font-semibold"
                                            }
                                        >
                                            {cart?.discountAmount &&
                                                cart.discountAmount > 0
                                                ? `-₹${cart.discountAmount}`
                                                : "₹0"}
                                        </span>
                                    </div>

                                    {cart?.couponCode && (
                                        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                                            {cart.couponCode}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-between border-b border-[#d8c8ad] py-4">
                                    <span className="font-medium">Shipping</span>
                                    <span className="font-semibold">Free</span>
                                </div>

                                <div className="flex justify-between py-5 text-xl font-semibold">
                                    <span>Total Payable</span>
                                    <span>₹{cart?.finalAmount}</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="border-b border-[#d8c8ad] pb-3 text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em]">
                                    Order Summary ({cart?.items.length ?? 0})
                                </h3>

                                <div className="mt-4 space-y-5">
                                    {cart?.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="grid grid-cols-[76px_1fr] gap-3 border-b border-[#d8c8ad] pb-5 sm:grid-cols-[90px_1fr] sm:gap-4"
                                        >
                                            {item.imageUrl && (
                                                <div className="relative h-20 overflow-hidden bg-[#efe3d0] sm:h-24">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.productName}
                                                        fill
                                                        className="object-contain p-3 drop-shadow-[0_16px_18px_rgba(22,18,13,0.14)]"
                                                    />
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <p className="text-xs uppercase tracking-[0.16em] text-[var(--luxury-gold)] sm:tracking-[0.24em]">
                                                    {item.brandName}
                                                </p>

                                                <h4 className="mt-1 font-normal [font-family:var(--font-serif)]">
                                                    {item.productName}
                                                </h4>

                                                <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                                    {item.gender} • {item.categoryName} •{" "}
                                                    {item.variantName}
                                                </p>

                                                <div className="mt-2 flex justify-between text-sm">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span className="font-semibold">
                                                        ₹{item.totalPrice}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
