"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Store } from "lucide-react";
import { createVendor } from "@/services/vendorService";
import { getApiResponse } from "@/services/api";

export default function VendorSettingsPage() {
    const [form, setForm] = useState({
        businessName: "",
        gstNumber: "",
        address: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [needsProfile, setNeedsProfile] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
        setNeedsProfile(true);
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");
        setError("");
        setSaving(true);

        try {
            await createVendor(form);
            setMessage("Vendor profile created. Please log in again to refresh your access.");
            setNeedsProfile(false);
        } catch (err: unknown) {
            const response = getApiResponse(err);
            setError(
                typeof response?.data === "string"
                    ? response.data
                    : "Vendor profile could not be created."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="py-20 text-center text-[var(--luxury-muted)]">Loading...</div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                    Vendor Studio
                </p>
                <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                    Settings
                </h1>
            </div>

            {message && (
                <div className="border border-[#b9c8a8] bg-[#f6fbef] p-4 text-sm text-[#455c2b]">
                    {message}
                </div>
            )}

            {error && (
                <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mx-auto max-w-3xl border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#d8c8ad] text-[var(--luxury-gold)]">
                    <Store size={24} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)] sm:tracking-[0.28em]">
                    Vendor Profile
                </p>
                <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl">
                    Business Details
                </h2>

                <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
                    <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">
                            Business Name
                        </span>
                        <input
                            value={form.businessName}
                            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                            required
                            className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 outline-none transition focus:border-[var(--luxury-gold)]"
                            placeholder="Your business name"
                        />
                    </label>

                    <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">
                            GST Number
                        </span>
                        <input
                            value={form.gstNumber}
                            onChange={(e) => setForm((f) => ({ ...f, gstNumber: e.target.value }))}
                            className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 outline-none transition focus:border-[var(--luxury-gold)]"
                            placeholder="Optional"
                        />
                    </label>

                    <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">
                            Address
                        </span>
                        <textarea
                            value={form.address}
                            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                            rows={4}
                            className="mt-2 w-full resize-none border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 py-3 outline-none transition focus:border-[var(--luxury-gold)]"
                            placeholder="Business address"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--luxury-ink)] px-6 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:opacity-50 sm:tracking-[0.16em]"
                    >
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
}
