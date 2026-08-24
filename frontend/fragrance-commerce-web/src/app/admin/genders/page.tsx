"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { updateSiteSetting } from "@/services/siteSettingsService";
import { api } from "@/services/api";

export default function AdminGendersPage() {
    const [genders, setGenders] = useState<string[]>([]);
    const [newGender, setNewGender] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadGenders();
    }, []);

    async function loadGenders() {
        try {
            const res = await api.get<{ value: string }>("/SiteSettings/available_genders");
            const parsed = JSON.parse(res.data.value);
            setGenders(Array.isArray(parsed) ? parsed : []);
        } catch {
            setGenders(["Men", "Women", "Unisex"]);
        } finally {
            setLoading(false);
        }
    }

    function addGender() {
        const trimmed = newGender.trim();
        if (!trimmed || genders.includes(trimmed)) return;
        setGenders([...genders, trimmed]);
        setNewGender("");
    }

    function removeGender(gender: string) {
        setGenders(genders.filter((g) => g !== gender));
    }

    async function handleSave() {
        setSaving(true);
        setMessage("");
        setError("");

        try {
            await updateSiteSetting("available_genders", JSON.stringify(genders));
            setMessage("Genders updated.");
        } catch {
            setError("Could not save genders.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                    Admin Studio
                </p>
                <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                    Genders
                </h1>
                <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                    Manage the gender options available when creating products.
                </p>
            </div>

            {message && <div className="border border-[#b9c8a8] bg-[#f6fbef] p-4 text-sm text-[#455c2b]">{message}</div>}
            {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-8">
                {loading ? (
                    <div className="text-center text-[var(--luxury-muted)]">Loading...</div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2">
                            {genders.map((gender) => (
                                <span
                                    key={gender}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#d8c8ad] bg-[var(--luxury-sand)] px-4 py-2 text-sm font-medium"
                                >
                                    {gender}
                                    <button
                                        type="button"
                                        onClick={() => removeGender(gender)}
                                        className="text-[var(--luxury-muted)] hover:text-red-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="mt-5 flex gap-3">
                            <input
                                value={newGender}
                                onChange={(e) => setNewGender(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGender(); } }}
                                placeholder="New gender option"
                                className="h-11 flex-1 border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                            <button
                                type="button"
                                onClick={addGender}
                                disabled={!newGender.trim()}
                                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8c8ad] px-4 text-sm font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold)] disabled:opacity-40"
                            >
                                <Plus size={14} />
                                Add
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:opacity-50"
                        >
                            <Save size={14} />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
