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
        // Check if vendor profile exists by trying to load dashboard
        // If the API returns 400 with "vendor profile", they need to create one
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
            <div className="py-20 text-center text-gray-400">Loading...</div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-sm font-medium text-gray-500">Settings</p>
                <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                    Vendor Profile
                </h1>
            </div>

            {message && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                    <Store size={20} className="text-gray-600" />
                </div>

                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Business Details
                </p>

                <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Business Name</span>
                        <input
                            value={form.businessName}
                            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                            required
                            className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-400"
                            placeholder="Your business name"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">GST Number</span>
                        <input
                            value={form.gstNumber}
                            onChange={(e) => setForm((f) => ({ ...f, gstNumber: e.target.value }))}
                            className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-400"
                            placeholder="Optional"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Address</span>
                        <textarea
                            value={form.address}
                            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                            rows={3}
                            className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                            placeholder="Business address"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
}
