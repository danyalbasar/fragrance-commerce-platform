"use client";

import Link from "next/link";
import { MapPin, ShoppingBag } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountPage() {
    const { email, initials, roles } = useAuth();

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-8 text-[var(--luxury-ink)] sm:px-6 sm:py-10">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-8 border-b border-[#d8c8ad] pb-6">
                        <h1 className="text-4xl font-normal leading-[1.05] [font-family:var(--font-serif)] sm:text-5xl">
                            Account
                        </h1>
                    </div>

                    <div className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6">
                        <div className="flex items-center gap-4">
                            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--luxury-gold)] text-lg font-semibold text-[var(--luxury-gold)]">
                                {initials}
                            </span>

                            <div className="min-w-0">
                                <p className="truncate text-sm text-[var(--luxury-muted)]">
                                    {email}
                                </p>

                                {roles.length > 0 && (
                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-muted)]">
                                        {roles.join(", ")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <Link
                            href="/addresses"
                            className="flex items-center gap-3 rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] px-5 py-4 shadow-[var(--luxury-shadow-sm)] transition-all duration-200 hover:border-[var(--luxury-gold)] hover:shadow-[var(--luxury-shadow-md)]"
                        >
                            <MapPin
                                size={18}
                                className="shrink-0 text-[var(--luxury-gold)]"
                            />

                            <span className="font-medium">
                                Saved Addresses
                            </span>
                        </Link>

                        <Link
                            href="/orders"
                            className="flex items-center gap-3 rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] px-5 py-4 shadow-[var(--luxury-shadow-sm)] transition-all duration-200 hover:border-[var(--luxury-gold)] hover:shadow-[var(--luxury-shadow-md)]"
                        >
                            <ShoppingBag
                                size={18}
                                className="shrink-0 text-[var(--luxury-gold)]"
                            />

                            <span className="font-medium">My Orders</span>
                        </Link>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
