"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Pencil } from "lucide-react";
import { getApiResponse } from "@/services/api";
import { api } from "@/services/api";

interface Brand {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
}

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadBrands();
    }, []);

    async function loadBrands() {
        try {
            const res = await api.get<Brand[]>("/Brands");
            setBrands(res.data);
        } catch {
            setError("Could not load brands.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            if (editingId) {
                await api.put(`/Brands/${editingId}`, { name, description });
            } else {
                await api.post("/Brands", { name, description });
            }
            setName("");
            setDescription("");
            setEditingId(null);
            await loadBrands();
        } catch (err) {
            const resp = getApiResponse(err);
            setError(typeof resp?.data === "string" ? resp.data : "Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this brand?")) return;
        try {
            await api.delete(`/Brands/${id}`);
            await loadBrands();
        } catch {
            setError("Could not delete brand.");
        }
    }

    function startEdit(brand: Brand) {
        setEditingId(brand.id);
        setName(brand.name);
        setDescription(brand.description || "");
    }

    function cancelEdit() {
        setEditingId(null);
        setName("");
        setDescription("");
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                    Admin Studio
                </p>
                <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                    Brands
                </h1>
            </div>

            {error && (
                <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-8">
                <h2 className="text-lg font-semibold [font-family:var(--font-serif)]">
                    {editingId ? "Edit Brand" : "Add Brand"}
                </h2>
                <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">Name</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">Description</span>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                        />
                    </label>
                    <div className="flex items-end gap-3 sm:col-span-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:opacity-50"
                        >
                            <Plus size={14} />
                            {saving ? "Saving..." : editingId ? "Update" : "Add"}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8c8ad] px-5 text-sm font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold)]"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                {loading ? (
                    <div className="p-10 text-center text-[var(--luxury-muted)]">Loading...</div>
                ) : brands.length === 0 ? (
                    <div className="p-10 text-center text-[var(--luxury-muted)]">No brands yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#d8c8ad] bg-[var(--luxury-sand)] text-xs uppercase tracking-[0.18em] text-[var(--luxury-muted-strong)]">
                                    <th className="px-5 py-4 font-semibold">Name</th>
                                    <th className="px-5 py-4 font-semibold">Description</th>
                                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brands.map((brand) => (
                                    <tr key={brand.id} className="border-b border-[#d8c8ad] last:border-0">
                                        <td className="px-5 py-4 font-semibold">{brand.name}</td>
                                        <td className="px-5 py-4 text-[var(--luxury-muted)]">{brand.description || "-"}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(brand)}
                                                    className="rounded-full p-2 text-[var(--luxury-muted)] hover:bg-[var(--luxury-sand)] hover:text-[var(--luxury-ink)]"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand.id)}
                                                    className="rounded-full p-2 text-[var(--luxury-muted)] hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
