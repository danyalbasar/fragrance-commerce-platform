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

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setSaving(true);

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
            alert("Failed to save address.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <ProtectedRoute>
            <main className="mx-auto max-w-3xl p-8">
                <h1 className="mb-8 text-4xl font-bold">Add Address</h1>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border bg-white p-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Full Name"
                            className="rounded-lg border px-4 py-3"
                            required
                        />

                        <input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Phone Number"
                            className="rounded-lg border px-4 py-3"
                            required
                        />

                        <input
                            value={addressLine1}
                            onChange={(e) => setAddressLine1(e.target.value)}
                            placeholder="Address Line 1"
                            className="rounded-lg border px-4 py-3 md:col-span-2"
                            required
                        />

                        <input
                            value={addressLine2}
                            onChange={(e) => setAddressLine2(e.target.value)}
                            placeholder="Address Line 2"
                            className="rounded-lg border px-4 py-3 md:col-span-2"
                        />

                        <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="rounded-lg border px-4 py-3"
                            required
                        />

                        <input
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="State"
                            className="rounded-lg border px-4 py-3"
                            required
                        />

                        <input
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="Postal Code"
                            className="rounded-lg border px-4 py-3"
                            required
                        />

                        <input
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country"
                            className="rounded-lg border px-4 py-3"
                            required
                        />
                    </div>

                    <label className="mt-4 flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                        />
                        Make this my default address
                    </label>

                    <button
                        disabled={saving}
                        className="mt-6 w-full rounded-full bg-black py-3 font-semibold text-white hover:bg-neutral-800 disabled:bg-gray-400"
                    >
                        {saving ? "Saving..." : "Save Address"}
                    </button>
                </form>
            </main>
        </ProtectedRoute>
    );
}