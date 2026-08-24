"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getSiteSettings, updateSiteSetting } from "@/services/siteSettingsService";

interface Field {
    key: string;
    label: string;
    type?: "text" | "textarea" | "url";
}

const heroFields: Field[] = [
    { key: "hero_image_url", label: "Hero Image URL", type: "url" },
    { key: "hero_title", label: "Hero Title" },
    { key: "hero_subtitle", label: "Hero Subtitle", type: "textarea" },
    { key: "hero_cta_text", label: "Primary CTA Text" },
    { key: "hero_cta_link", label: "Primary CTA Link" },
    { key: "hero_secondary_cta_text", label: "Secondary CTA Text" },
    { key: "hero_secondary_cta_link", label: "Secondary CTA Link" },
];

const panel1Fields: Field[] = [
    { key: "category_panel_1_image", label: "Panel 1 Image URL", type: "url" },
    { key: "category_panel_1_eyebrow", label: "Panel 1 Eyebrow" },
    { key: "category_panel_1_title", label: "Panel 1 Title" },
    { key: "category_panel_1_text", label: "Panel 1 Text", type: "textarea" },
    { key: "category_panel_1_link", label: "Panel 1 Link" },
    { key: "category_panel_1_cta", label: "Panel 1 CTA" },
];

const panel2Fields: Field[] = [
    { key: "category_panel_2_image", label: "Panel 2 Image URL", type: "url" },
    { key: "category_panel_2_eyebrow", label: "Panel 2 Eyebrow" },
    { key: "category_panel_2_title", label: "Panel 2 Title" },
    { key: "category_panel_2_text", label: "Panel 2 Text", type: "textarea" },
    { key: "category_panel_2_link", label: "Panel 2 Link" },
    { key: "category_panel_2_cta", label: "Panel 2 CTA" },
];

export default function AdminHomepagePage() {
    const [values, setValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const settings = await getSiteSettings();
            const map: Record<string, string> = {};
            settings.forEach((s) => { map[s.key] = s.value; });
            setValues(map);
        } catch {
            setError("Could not load settings.");
        } finally {
            setLoading(false);
        }
    }

    function update(key: string, value: string) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave() {
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const allFields = [...heroFields, ...panel1Fields, ...panel2Fields];
            await Promise.all(
                allFields.map((f) => updateSiteSetting(f.key, values[f.key] || ""))
            );
            setMessage("Homepage settings saved.");
        } catch {
            setError("Could not save settings.");
        } finally {
            setSaving(false);
        }
    }

    function renderSection(title: string, fields: Field[]) {
        return (
            <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-8">
                <h2 className="text-lg font-semibold [font-family:var(--font-serif)]">{title}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {fields.map((field) => (
                        <label key={field.key} className={`block ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">
                                {field.label}
                            </span>
                            {field.type === "textarea" ? (
                                <textarea
                                    value={values[field.key] || ""}
                                    onChange={(e) => update(field.key, e.target.value)}
                                    rows={3}
                                    className="mt-2 w-full resize-none border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 py-3 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                                />
                            ) : (
                                <input
                                    type={field.type === "url" ? "url" : "text"}
                                    value={values[field.key] || ""}
                                    onChange={(e) => update(field.key, e.target.value)}
                                    className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                                />
                            )}
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                        Admin Studio
                    </p>
                    <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                        Homepage
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:opacity-50"
                >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save All"}
                </button>
            </div>

            {message && <div className="border border-[#b9c8a8] bg-[#f6fbef] p-4 text-sm text-[#455c2b]">{message}</div>}
            {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            {loading ? (
                <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-10 text-center text-[var(--luxury-muted)]">
                    Loading settings...
                </div>
            ) : (
                <>
                    {renderSection("Hero Section", heroFields)}
                    {renderSection("Category Panel 1", panel1Fields)}
                    {renderSection("Category Panel 2", panel2Fields)}
                </>
            )}
        </div>
    );
}
