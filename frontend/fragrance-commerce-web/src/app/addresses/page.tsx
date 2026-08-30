"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Pencil, Trash2, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { EmptyState } from "@/components/common/EmptyState";
import type { Address } from "@/types/address";
import { getAddresses, deleteAddress } from "@/services/addressService";

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function loadAddresses() {
        try {
            setLoading(true);
            setError("");
            const data = await getAddresses();
            setAddresses(data);
        } catch {
            setError("Failed to load addresses. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAddresses();
    }, []);

    async function handleDelete(id: string) {
        try {
            setDeletingId(id);
            setError("");
            await deleteAddress(id);
            setAddresses((prev) => prev.filter((a) => a.id !== id));
            setConfirmingDeleteId(null);
        } catch {
            setError("Failed to delete address. Please try again.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/account"
                        className="mb-6 block text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)] hover:text-[var(--luxury-gold-strong)]"
                    >
                        ← Back to Account
                    </Link>

                    <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-[#d8c8ad] pb-6">
                        <h1 className="text-4xl font-normal leading-[1.05] [font-family:var(--font-serif)] sm:text-5xl">
                            Saved Addresses
                        </h1>

                        <Link
                            href="/addresses/new"
                            className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-gold-strong)] sm:tracking-[0.14em]"
                        >
                            + Add New
                        </Link>
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="mb-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="animate-pulse rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5"
                                >
                                    <div className="h-4 w-32 rounded bg-[var(--luxury-sand)]" />
                                    <div className="mt-3 h-3 w-full rounded bg-[var(--luxury-sand)]" />
                                    <div className="mt-2 h-3 w-3/4 rounded bg-[var(--luxury-sand)]" />
                                    <div className="mt-2 h-3 w-1/2 rounded bg-[var(--luxury-sand)]" />
                                </div>
                            ))}
                        </div>
                    ) : addresses.length === 0 ? (
                        <EmptyState
                            icon={MapPin}
                            title="No saved addresses"
                            description="Add a shipping address to use at checkout."
                            actionLabel="Add Address"
                            actionHref="/addresses/new"
                        />
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] transition-all duration-200 hover:shadow-[var(--luxury-shadow-md)] sm:p-6"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold">
                                            {address.fullName}
                                        </p>

                                        {address.isDefault && (
                                            <span className="rounded-full border border-[#b7c7a8] bg-[#eef5e8] px-2 py-1 text-xs font-medium text-[#3f5f32]">
                                                Default
                                            </span>
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

                                    <div className="mt-4 flex items-center gap-3 border-t border-[var(--luxury-line)] pt-4">
                                        {confirmingDeleteId === address.id ? (
                                            <>
                                                <span className="text-sm text-[var(--luxury-muted)]">
                                                    Delete this address?
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            address.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId !== null
                                                    }
                                                    className="text-sm font-semibold text-red-600 transition-colors duration-200 hover:text-red-700 disabled:opacity-40"
                                                >
                                                    {deletingId ===
                                                    address.id ? (
                                                        <Loader2
                                                            size={14}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        "Yes"
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setConfirmingDeleteId(
                                                            null
                                                        )
                                                    }
                                                    className="text-sm font-semibold text-[var(--luxury-muted)] transition-colors duration-200 hover:text-[var(--luxury-ink)]"
                                                >
                                                    No
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/checkout"
                                                    className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--luxury-gold-strong)] transition-colors duration-200 hover:text-[var(--luxury-gold)]"
                                                >
                                                    <Pencil size={13} />
                                                    Edit
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        setConfirmingDeleteId(
                                                            address.id
                                                        )
                                                    }
                                                    className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-red-600 transition-colors duration-200 hover:text-red-700"
                                                >
                                                    <Trash2 size={13} />
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}
