"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    Check,
    Eye,
    LayoutTemplate,
    MousePointer2,
    Save,
    Type,
    X,
} from "lucide-react";
import { getSiteSettings, updateSiteSetting } from "@/services/siteSettingsService";

type SectionId = "hero" | "panels" | "panel1" | "panel2";

interface SectionDef {
    id: SectionId;
    label: string;
    icon: React.ReactNode;
    fields: Field[];
}

interface Field {
    key: string;
    label: string;
    type?: "text" | "textarea" | "url" | "image";
    span?: boolean;
}

const sections: SectionDef[] = [
    {
        id: "hero",
        label: "Hero",
        icon: <LayoutTemplate size={16} />,
        fields: [
            { key: "hero_image_url", label: "Background Image", type: "image" },
            { key: "hero_title", label: "Title" },
            { key: "hero_subtitle", label: "Subtitle", type: "textarea" },
            { key: "hero_cta_text", label: "Primary CTA Text" },
            { key: "hero_cta_link", label: "Primary CTA Link" },
            { key: "hero_secondary_cta_text", label: "Secondary CTA Text" },
            { key: "hero_secondary_cta_link", label: "Secondary CTA Link" },
        ],
    },
    {
        id: "panel1",
        label: "Category Panel 1",
        icon: <MousePointer2 size={16} />,
        fields: [
            { key: "category_panel_1_image", label: "Image", type: "image" },
            { key: "category_panel_1_eyebrow", label: "Eyebrow" },
            { key: "category_panel_1_title", label: "Title" },
            { key: "category_panel_1_text", label: "Text", type: "textarea" },
            { key: "category_panel_1_link", label: "Link" },
            { key: "category_panel_1_cta", label: "CTA Text" },
        ],
    },
    {
        id: "panel2",
        label: "Category Panel 2",
        icon: <MousePointer2 size={16} />,
        fields: [
            { key: "category_panel_2_image", label: "Image", type: "image" },
            { key: "category_panel_2_eyebrow", label: "Eyebrow" },
            { key: "category_panel_2_title", label: "Title" },
            { key: "category_panel_2_text", label: "Text", type: "textarea" },
            { key: "category_panel_2_link", label: "Link" },
            { key: "category_panel_2_cta", label: "CTA Text" },
        ],
    },
];

export default function HomepageEditorPage() {
    const [values, setValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState<SectionId>("hero");
    const [hoveredSection, setHoveredSection] = useState<SectionId | null>(null);
    const [previewScale, setPreviewScale] = useState(1);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const previewInnerRef = useRef<HTMLDivElement>(null);

    const currentSection = sections.find((s) => s.id === activeSection)!;

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        const container = previewContainerRef.current;
        const inner = previewInnerRef.current;
        if (!container || !inner) return;

        function updateScale() {
            const containerWidth = container!.clientWidth;
            const contentWidth = 1440;
            const scale = Math.min(containerWidth / contentWidth, 1);
            setPreviewScale(scale);
        }

        updateScale();
        const ro = new ResizeObserver(updateScale);
        ro.observe(container);
        return () => ro.disconnect();
    }, []);

    async function loadSettings() {
        try {
            const settings = await getSiteSettings();
            const map: Record<string, string> = {};
            settings.forEach((s) => {
                map[s.key] = s.value;
            });
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
            const allFields = sections.flatMap((s) => s.fields);
            await Promise.all(
                allFields.map((f) => updateSiteSetting(f.key, values[f.key] || ""))
            );
            setMessage("All changes saved.");
        } catch {
            setError("Could not save.");
        } finally {
            setSaving(false);
        }
    }

    const get = useCallback(
        (key: string, fallback = "") => values[key] || fallback,
        [values]
    );

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#1a1a1a]">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">
                    Loading editor...
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full overflow-hidden bg-[#1a1a1a]">
            {/* Left: Section selector + Editor */}
            <div className="flex w-[380px] min-w-[380px] flex-col border-r border-[#2a2a2a] bg-[#111]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/homepage"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold)]">
                                Visual Editor
                            </p>
                            <h1 className="text-sm font-semibold text-white">
                                Homepage
                            </h1>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--luxury-gold)] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-ink)] transition hover:brightness-110 disabled:opacity-50"
                    >
                        {saving ? (
                            "Saving..."
                        ) : (
                            <>
                                <Save size={13} />
                                Save
                            </>
                        )}
                    </button>
                </div>

                {/* Status messages */}
                {message && (
                    <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                        <Check size={13} />
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                        <X size={13} />
                        {error}
                    </div>
                )}

                {/* Section tabs */}
                <div className="flex gap-1 border-b border-[#2a2a2a] px-4 py-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => setActiveSection(section.id)}
                            onMouseEnter={() => setHoveredSection(section.id)}
                            onMouseLeave={() => setHoveredSection(null)}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition ${
                                activeSection === section.id
                                    ? "bg-[var(--luxury-gold)] text-[var(--luxury-ink)]"
                                    : "text-white/50 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {section.icon}
                            {section.label.replace("Category ", "")}
                        </button>
                    ))}
                </div>

                {/* Fields */}
                <div className="flex-1 overflow-y-auto px-4 py-5 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                        {currentSection.label} Settings
                    </p>
                    <div className="space-y-4">
                        {currentSection.fields.map((field) => (
                            <label key={field.key} className="block">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                                    {field.label}
                                </span>
                                {field.type === "textarea" ? (
                                    <textarea
                                        value={get(field.key)}
                                        onChange={(e) =>
                                            update(field.key, e.target.value)
                                        }
                                        rows={3}
                                        className="mt-1.5 w-full resize-none rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
                                    />
                                ) : field.type === "image" ? (
                                    <>
                                        <input
                                            type="url"
                                            value={get(field.key)}
                                            onChange={(e) =>
                                                update(field.key, e.target.value)
                                            }
                                            placeholder="/home/your-image.jpg"
                                            className="mt-1.5 h-10 w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-3 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
                                        />
                                        {get(field.key) && (
                                            <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg border border-[#333]">
                                                <Image
                                                    src={get(field.key)}
                                                    alt={field.label}
                                                    fill
                                                    sizes="340px"
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <input
                                        type="text"
                                        value={get(field.key)}
                                        onChange={(e) =>
                                            update(field.key, e.target.value)
                                        }
                                        className="mt-1.5 h-10 w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-3 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
                                    />
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Live preview */}
            <div
                ref={previewContainerRef}
                className="relative flex-1 overflow-auto bg-[#222]"
                style={{ height: "100%" }}
            >
                {/* Preview chrome */}
                <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#333] bg-[#1a1a1a] px-4 py-2">
                    <Eye size={13} className="text-white/40" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                        Live Preview
                    </span>
                </div>

                {/* Full-width preview */}
                <div className="w-full overflow-hidden">
                    <div
                        ref={previewInnerRef}
                        style={{
                            width: `${1440 * previewScale}px`,
                            height: `${6000 * previewScale}px`,
                        }}
                    >
                        <div
                            style={{
                                width: 1440,
                                transform: `scale(${previewScale})`,
                                transformOrigin: "top left",
                            }}
                        >
                            <PreviewHero
                        values={values}
                        get={get}
                        isActive={activeSection === "hero"}
                        isHovered={hoveredSection === "hero"}
                        onSelect={() => setActiveSection("hero")}
                        onHover={(h) => setHoveredSection(h ? "hero" : null)}
                    />
                    <PreviewValueBar />
                    <PreviewCategoryPanels
                        values={values}
                        get={get}
                        activeSection={activeSection}
                        hoveredSection={hoveredSection}
                        onSelect={(id) => setActiveSection(id)}
                        onHover={(h) => setHoveredSection(h)}
                    />
                    <PreviewRestSections />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Preview sub-components ──────────────────────────────────────────── */

function SectionOverlay({
    label,
    isActive,
    isHovered,
    onSelect,
    onHover,
    children,
}: {
    label: string;
    isActive: boolean;
    isHovered: boolean;
    onSelect: () => void;
    onHover: (hovered: boolean) => void;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`relative cursor-pointer transition-all ${
                isActive
                    ? "ring-2 ring-[var(--luxury-gold)] ring-offset-2 ring-offset-[#222]"
                    : isHovered
                      ? "ring-2 ring-blue-400/60 ring-offset-2 ring-offset-[#222]"
                      : ""
            }`}
            onClick={onSelect}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
        >
            {(isActive || isHovered) && (
                <div
                    className={`absolute left-2 top-2 z-20 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] shadow-lg ${
                        isActive
                            ? "bg-[var(--luxury-gold)] text-[var(--luxury-ink)]"
                            : "bg-blue-500 text-white"
                    }`}
                >
                    <Type size={10} />
                    {label}
                </div>
            )}
            {children}
        </div>
    );
}

function PreviewHero({
    values,
    get,
    isActive,
    isHovered,
    onSelect,
    onHover,
}: {
    values: Record<string, string>;
    get: (key: string, fallback?: string) => string;
    isActive: boolean;
    isHovered: boolean;
    onSelect: () => void;
    onHover: (hovered: boolean) => void;
}) {
    return (
        <SectionOverlay
            label="Hero"
            isActive={isActive}
            isHovered={isHovered}
            onSelect={onSelect}
            onHover={onHover}
        >
            <div className="relative h-[700px] overflow-hidden bg-[#1a1a1a]">
                {get("hero_image_url") && (
                    <Image
                        src={get("hero_image_url")}
                        alt="Hero"
                        fill
                        sizes="1440px"
                        className="object-cover"
                        unoptimized
                    />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,18,13,0.84)_0%,rgba(22,18,13,0.56)_42%,rgba(22,18,13,0.06)_100%)]" />
                <div className="relative flex h-full items-center px-12">
                    <div className="max-w-2xl text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[var(--luxury-gold)]">
                            Private Fragrance House
                        </p>
                        <h1 className="mt-5 text-7xl font-normal leading-[1.02] [font-family:var(--font-serif)]">
                            {get("hero_title", "Your hero title here")}
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
                            {get("hero_subtitle", "Your hero subtitle here")}
                        </p>
                        <div className="mt-10 flex gap-4">
                            <span className="inline-flex justify-center rounded-full bg-[var(--luxury-gold)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-ink)]">
                                {get("hero_cta_text", "Shop Collection")}
                            </span>
                            <span className="inline-flex justify-center rounded-full border border-white/45 px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                                {get("hero_secondary_cta_text", "Discover Scents")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </SectionOverlay>
    );
}

function PreviewValueBar() {
    return (
        <div className="border-y border-[#d8c8ad] bg-[rgba(255,250,242,0.72)] px-6 py-5 backdrop-blur-xl">
            <div className="mx-auto grid max-w-[1800px] gap-4 text-center text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-muted)] md:grid-cols-4">
                <span>Cloud-like skincare</span>
                <span>Amber-rich attars</span>
                <span>Genderless signatures</span>
                <span>Private house labels</span>
            </div>
        </div>
    );
}

function PreviewCategoryPanels({
    values,
    get,
    activeSection,
    hoveredSection,
    onSelect,
    onHover,
}: {
    values: Record<string, string>;
    get: (key: string, fallback?: string) => string;
    activeSection: SectionId;
    hoveredSection: SectionId | null;
    onSelect: (id: SectionId) => void;
    onHover: (id: SectionId | null) => void;
}) {
    return (
        <section className="px-8 py-20">
            <div className="mx-auto max-w-[1800px]">
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                            Enter the House
                        </p>
                        <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">
                            Choose your ritual.
                        </h2>
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">
                        View all products
                    </span>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <SectionOverlay
                        label="Category Panel 1"
                        isActive={activeSection === "panel1"}
                        isHovered={hoveredSection === "panel1"}
                        onSelect={() => onSelect("panel1")}
                        onHover={(h) => onHover(h ? "panel1" : null)}
                    >
                        <PreviewCategoryCard
                            image={get("category_panel_1_image", "/home/home-fragrance.jpg")}
                            eyebrow={get("category_panel_1_eyebrow", "Fragrance Wardrobe")}
                            title={get("category_panel_1_title", "Perfumes, attars, and customised blends")}
                            text={get("category_panel_1_text", "From saffroned warmth to smoky cedar...")}
                            cta={get("category_panel_1_cta", "Shop Fragrance")}
                        />
                    </SectionOverlay>
                    <SectionOverlay
                        label="Category Panel 2"
                        isActive={activeSection === "panel2"}
                        isHovered={hoveredSection === "panel2"}
                        onSelect={() => onSelect("panel2")}
                        onHover={(h) => onHover(h ? "panel2" : null)}
                    >
                        <PreviewCategoryCard
                            image={get("category_panel_2_image", "/home/home-skincare.jpg")}
                            eyebrow={get("category_panel_2_eyebrow", "Skin Rituals")}
                            title={get("category_panel_2_title", "Cleansers, creams, and polished care")}
                            text={get("category_panel_2_text", "Soft-focus skincare essentials...")}
                            cta={get("category_panel_2_cta", "Shop Skincare")}
                        />
                    </SectionOverlay>
                </div>
            </div>
        </section>
    );
}

function PreviewCategoryCard({
    image,
    eyebrow,
    title,
    text,
    cta,
}: {
    image: string;
    eyebrow: string;
    title: string;
    text: string;
    cta: string;
}) {
    return (
        <div className="group block">
            <div className="relative min-h-[560px] overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                    unoptimized
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,18,13,0.1)_0%,rgba(22,18,13,0.48)_48%,rgba(22,18,13,0.86)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-10 text-white">
                    <p className="inline-flex bg-[rgba(22,18,13,0.58)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#f1c778] shadow-[0_12px_30px_rgba(22,18,13,0.28)] backdrop-blur-sm">
                        {eyebrow}
                    </p>
                    <h3 className="mt-3 text-4xl font-normal leading-tight [font-family:var(--font-serif)]">
                        {title}
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-7 text-white/76">
                        {text}
                    </p>
                    <span className="mt-6 inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold)]">
                        {cta}
                    </span>
                </div>
            </div>
        </div>
    );
}

function PreviewRestSections() {
    return (
        <>
            <section className="bg-[#efe3d0] px-8 py-20">
                <div className="mx-auto max-w-[1800px]">
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                                Featured Collection
                            </p>
                            <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">
                                Objects of desire.
                            </h2>
                        </div>
                        <p className="max-w-md text-sm leading-7 text-[var(--luxury-muted)]">
                            A focused selection from the private labels now available in the store.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="border border-[#d8c8ad] bg-[var(--luxury-paper)]"
                            >
                                <div className="aspect-[1/1.18] animate-pulse bg-[#ead9c0]" />
                                <div className="flex flex-col gap-3 p-5">
                                    <div className="h-3 w-24 animate-pulse rounded bg-[#e5d9c4]" />
                                    <div className="h-6 w-40 animate-pulse rounded bg-[#e5d9c4]" />
                                    <div className="h-4 w-28 animate-pulse rounded bg-[#e5d9c4]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-8 py-20">
                <div className="mx-auto max-w-[1800px]">
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                                Most Loved
                            </p>
                            <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">
                                The best sellers.
                            </h2>
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">
                            View all
                        </span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[1/1.08] animate-pulse rounded-[var(--luxury-radius)] bg-[#efe3d0]"
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#efe3d0] px-8 py-20">
                <div className="mx-auto max-w-[1800px]">
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                                Just Arrived
                            </p>
                            <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">
                                New arrivals.
                            </h2>
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">
                            Explore new
                        </span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[1/1.08] animate-pulse rounded-[var(--luxury-radius)] bg-[#ead9c0]"
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-[#d8c8ad] bg-[rgba(255,250,242,0.72)] px-8 py-16 backdrop-blur-xl">
                <div className="mx-auto max-w-[1800px]">
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-muted)]">
                        The Houses &amp; Partners
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        {["Aurelian Atelier", "Nocturne Vale", "Mira Solace", "Vellum & Dew"].map(
                            (brand) => (
                                <span
                                    key={brand}
                                    className="text-lg font-normal uppercase tracking-[0.16em] text-[var(--luxury-muted)] [font-family:var(--font-serif)]"
                                >
                                    {brand}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[var(--luxury-ink)] px-8 py-28 text-[var(--luxury-paper)]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(182,138,66,0.14)_0%,rgba(22,18,13,0)_68%)]" />
                <div className="relative mx-auto max-w-4xl text-center">
                    <span
                        aria-hidden
                        className="block text-7xl leading-[0.6] text-[var(--luxury-gold)] [font-family:var(--font-serif)]"
                    >
                        &ldquo;
                    </span>
                    <blockquote className="mt-4 text-4xl font-normal leading-relaxed [font-family:var(--font-serif)]">
                        A fragrance should be worn like a signature &mdash; quietly,
                        deliberately, and entirely your own.
                    </blockquote>
                    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
                        The House Motto
                    </p>
                </div>
            </section>

            <section className="px-8 py-20">
                <div className="mx-auto grid max-w-[1800px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div className="relative aspect-[3/2] overflow-hidden bg-[#efe0ca]">
                        <Image
                            src="/home/home-ritual.jpg"
                            alt="Fragrance and skincare ritual objects"
                            fill
                            sizes="720px"
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">
                            Maison Notes
                        </p>
                        <h2 className="mt-3 text-6xl font-normal leading-tight [font-family:var(--font-serif)]">
                            A storefront for house labels that still feels tactile.
                        </h2>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">
                            The collection is staged like a real luxury catalogue: restrained
                            navigation, visual hierarchy, product-led imagery, and clear
                            paths into fragrance or skincare.
                        </p>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            {["Aurelian Atelier", "Nocturne Vale", "Mira Solace", "Vellum & Dew"].map(
                                (house) => (
                                    <span
                                        key={house}
                                        className="border-b border-[#d8c8ad] py-4 text-lg [font-family:var(--font-serif)]"
                                    >
                                        {house}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
