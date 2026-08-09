"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { createAddress } from "@/services/addressService";

export default function NewAddressPage() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("India");
    const [isDefault, setIsDefault] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            await createAddress({
                fullName,
                phoneNumber,
                addressLine1,
                addressLine2,
                city,
                state,
                postalCode,
                country,
                isDefault,
            });

            router.push("/checkout");
        } catch (error) {
            console.error(error);
            setError("Failed to save address. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-3xl">
                <div className="mb-8 border-b border-[#d8c8ad] pb-6">
                    <h1 className="text-4xl font-normal leading-[1.05] [font-family:var(--font-serif)] sm:text-5xl">
                        Add Address
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6"
                >
                    {error && (
                        <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Full Name"
                            aria-label="Full name"
                            autoComplete="name"
                            className="border border-[#d8c8ad] bg-[var(--luxury-input)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                            required
                        />

                        <input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Phone Number"
                            aria-label="Phone number"
                            type="tel"
                            autoComplete="tel"
                            className="border border-[#d8c8ad] bg-[var(--luxury-input)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                            required
                        />

                        <input
                            value={addressLine1}
                            onChange={(e) => setAddressLine1(e.target.value)}
                            placeholder="Address Line 1"
                            aria-label="Address line 1"
                            autoComplete="address-line1"
                            className="border border-[#d8c8ad] bg-[var(--luxury-input)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)] md:col-span-2"
                            required
                        />

                        <input
                            value={addressLine2}
                            onChange={(e) => setAddressLine2(e.target.value)}
                            placeholder="Address Line 2"
                            aria-label="Address line 2"
                            autoComplete="address-line2"
                            className="border border-[#d8c8ad] bg-[var(--luxury-input)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)] md:col-span-2"
                        />

                        <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            aria-label="City"
                            autoComplete="address-level2"
                            className="border border-[#d8c8ad] bg-[var(--luxury-input)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                            required
                        />

                        <input
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="State"
                            aria-label="State"
                            autoComplete="address-level1"
                            className="border border-[#d8c8ad] bg-[var(--luxury-input)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                            required
                        />

                        <input
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="Postal Code"
                            aria-label="Postal code"
                            autoComplete="postal-code"
                            className="border border-[#d8c8ad] bg-[var(--luxury-input)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                            required
                        />

                        <input
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country"
                            aria-label="Country"
                            autoComplete="country-name"
                            className="border border-[#d8c8ad] bg-[var(--luxury-input)] px-4 py-3 outline-none focus:border-[var(--luxury-gold)]"
                            required
                        />
                    </div>

                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="cursor-pointer accent-[var(--luxury-gold)]"
                        />
                        Make this my default address
                    </label>

                    <button
                        disabled={saving}
                        className="mt-6 w-full cursor-pointer rounded-full bg-[var(--luxury-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] shadow-[0_14px_30px_rgba(22,18,13,0.12)] transition hover:bg-[var(--luxury-moss)] disabled:cursor-not-allowed disabled:bg-[var(--luxury-muted-strong)] sm:tracking-[0.14em]"
                    >
                        {saving ? "Saving..." : "Save Address"}
                    </button>
                </form>
                </div>
            </main>
        </ProtectedRoute>
    );
}