"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getSiteSettings, updateSiteSetting } from "@/services/siteSettingsService";
import { getPublicSettings } from "@/services/siteSettingsService";
import { themePresets, applyTheme, getThemeById } from "@/lib/themes";

export default function AdminThemesPage() {
    const [activeTheme, setActiveTheme] = useState("classic-gold");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        getPublicSettings()
            .then((settings) => {
                const id = settings.active_theme || "classic-gold";
                setActiveTheme(id);
                applyTheme(getThemeById(id));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    function previewTheme(id: string) {
        setActiveTheme(id);
        applyTheme(getThemeById(id));
    }

    async function saveTheme() {
        setSaving(true);
        setMessage("");
        try {
            await updateSiteSetting("active_theme", activeTheme);
            setMessage("Theme saved. All visitors will see this theme.");
        } catch {
            setMessage("Could not save theme.");
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
                    Themes
                </h1>
                <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                    Select a theme for the entire storefront. Changes apply to all visitors.
                </p>
            </div>

            {message && (
                <div className="border border-[#b9c8a8] bg-[#f6fbef] p-4 text-sm text-[#455c2b]">{message}</div>
            )}

            {loading ? (
                <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-10 text-center text-[var(--luxury-muted)]">
                    Loading...
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {themePresets.map((preset) => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => previewTheme(preset.id)}
                                className={`relative border bg-[var(--luxury-paper)] p-5 text-left shadow-[0_18px_50px_rgba(22,18,13,0.08)] transition hover:shadow-[0_18px_50px_rgba(22,18,13,0.14)] ${
                                    activeTheme === preset.id
                                        ? "border-[var(--luxury-gold)] ring-1 ring-[var(--luxury-gold)]"
                                        : "border-[#d8c8ad]"
                                }`}
                            >
                                {activeTheme === preset.id && (
                                    <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--luxury-gold)] text-[var(--luxury-paper)]">
                                        <Check size={14} />
                                    </div>
                                )}
                                <p className="text-lg font-semibold [font-family:var(--font-serif)]">
                                    {preset.name}
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <div className="h-8 w-8 rounded-full border border-[#d8c8ad]" style={{ backgroundColor: preset.colors.ink }} title="Ink" />
                                    <div className="h-8 w-8 rounded-full border border-[#d8c8ad]" style={{ backgroundColor: preset.colors.gold }} title="Gold" />
                                    <div className="h-8 w-8 rounded-full border border-[#d8c8ad]" style={{ backgroundColor: preset.colors.moss }} title="Moss" />
                                    <div className="h-8 w-8 rounded-full border border-[#d8c8ad]" style={{ backgroundColor: preset.colors.ivory }} title="Ivory" />
                                    <div className="h-8 w-8 rounded-full border border-[#d8c8ad]" style={{ backgroundColor: preset.colors.paper }} title="Paper" />
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={saveTheme}
                        disabled={saving}
                        className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Active Theme"}
                    </button>
                </>
            )}
        </div>
    );
}
