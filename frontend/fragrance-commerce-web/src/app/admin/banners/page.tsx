"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getSiteSettings, updateSiteSetting } from "@/services/siteSettingsService";

const bannerFields = [
    { key: "product_banner_image", label: "Banner Image", type: "image" as const },
    { key: "product_banner_title", label: "Banner Title" },
    { key: "product_banner_text", label: "Banner Text", type: "textarea" as const },
];

function ImagePreview({ src }: { src: string }) {
    if (!src) return null;

    return (
        <div className="mt-3 relative aspect-video w-full overflow-hidden rounded border border-[#d8c8ad] bg-[#efe3d0]">
            <Image
                src={src}
                alt="Preview"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
                unoptimized
            />
        </div>
    );
}

export default function AdminBannersPage() {
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
            await Promise.all(
                bannerFields.map((f) => updateSiteSetting(f.key, values[f.key] || ""))
            );
            setMessage("Banner settings saved.");
        } catch {
            setError("Could not save settings.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                        Admin Studio
                    </p>
                    <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                        Banners
                    </h1>
                    <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                        Manage the banner displayed on the products page.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:opacity-50"
                >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>

            {message && <div className="border border-[#b9c8a8] bg-[#f6fbef] p-4 text-sm text-[#455c2b]">{message}</div>}
            {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-8">
                {loading ? (
                    <div className="text-center text-[var(--luxury-muted)]">Loading...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {bannerFields.map((field) => (
                            <label key={field.key} className={`block ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-muted)]">
                                    {field.label}
                                </span>
                                {field.type === "textarea" ? (
                                    <textarea
                                        value={values[field.key] || ""}
                                        onChange={(e) => update(field.key, e.target.value)}
                                        rows={4}
                                        className="mt-2 w-full resize-none border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 py-3 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                                    />
                                ) : field.type === "image" ? (
                                    <>
                                        <input
                                            type="url"
                                            value={values[field.key] || ""}
                                            onChange={(e) => update(field.key, e.target.value)}
                                            placeholder="/home/your-image.jpg"
                                            className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                                        />
                                        <ImagePreview src={values[field.key] || ""} />
                                    </>
                                ) : (
                                    <input
                                        type="text"
                                        value={values[field.key] || ""}
                                        onChange={(e) => update(field.key, e.target.value)}
                                        className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[var(--luxury-input)] px-3 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                                    />
                                )}
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
