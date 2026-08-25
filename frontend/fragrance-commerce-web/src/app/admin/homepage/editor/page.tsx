"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  LayoutTemplate,
  MousePointer2,
  Save,
  Type,
  X,
  ImageIcon,
  List,
  Quote,
  Star,
  Shield,
  Mail,
  Megaphone,
  Plus,
  Trash2,
  Search,
  GripVertical,
  Eye,
  EyeOff,
  Truck,
  RotateCcw,
  Lock,
} from "lucide-react";
import {
  getSiteSettings,
  updateSiteSetting,
} from "@/services/siteSettingsService";
import { productService } from "@/services/productService";
import ImageUploadField from "@/components/common/ImageUploadField";
import type { Product } from "@/types/product";

/* ── Types ────────────────────────────────────────────────────────── */

type TemplateId = "homepage" | "products";

type HomepageSectionId =
  | "hero"
  | "valuebar"
  | "panel1"
  | "panel2"
  | "featured"
  | "quote"
  | "promises"
  | "newsletter"
  | "cta"
  | "banner";

type ProductsSectionId = "products_banner" | "product_trust" | "product_shipping";

type SectionId = HomepageSectionId | ProductsSectionId;

type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "list"
  | "object-list"
  | "product-picker";

interface Field {
  key: string;
  label: string;
  type?: FieldType;
}

interface SectionDef {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  fields: Field[];
}

interface TemplateDef {
  id: TemplateId;
  label: string;
  sections: SectionDef[];
}

/* ── Section definitions ──────────────────────────────────────────── */

const homepageSections: SectionDef[] = [
  {
    id: "hero",
    label: "Hero",
    icon: <LayoutTemplate size={15} />,
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
    id: "valuebar",
    label: "Value Bar",
    icon: <List size={15} />,
    fields: [{ key: "value_bar_items", label: "Items", type: "list" }],
  },
  {
    id: "panel1",
    label: "Category Panel 1",
    icon: <MousePointer2 size={15} />,
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
    icon: <MousePointer2 size={15} />,
    fields: [
      { key: "category_panel_2_image", label: "Image", type: "image" },
      { key: "category_panel_2_eyebrow", label: "Eyebrow" },
      { key: "category_panel_2_title", label: "Title" },
      { key: "category_panel_2_text", label: "Text", type: "textarea" },
      { key: "category_panel_2_link", label: "Link" },
      { key: "category_panel_2_cta", label: "CTA Text" },
    ],
  },
  {
    id: "featured",
    label: "Featured Products",
    icon: <Star size={15} />,
    fields: [
      { key: "featured_section_title", label: "Section Title" },
      { key: "featured_section_subtitle", label: "Section Subtitle", type: "textarea" },
      { key: "featured_product_ids", label: "Select Products", type: "product-picker" },
    ],
  },
  {
    id: "quote",
    label: "Quote",
    icon: <Quote size={15} />,
    fields: [
      { key: "quote_text", label: "Quote Text", type: "textarea" },
      { key: "quote_attribution", label: "Attribution" },
    ],
  },
  {
    id: "promises",
    label: "House Promises",
    icon: <Shield size={15} />,
    fields: [{ key: "house_promises", label: "Promises", type: "object-list" }],
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: <Mail size={15} />,
    fields: [
      { key: "newsletter_title", label: "Title" },
      { key: "newsletter_subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  {
    id: "cta",
    label: "Bottom CTA",
    icon: <Megaphone size={15} />,
    fields: [
      { key: "cta_title", label: "Title" },
      { key: "cta_subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_button_text", label: "Button Text" },
      { key: "cta_button_link", label: "Button Link" },
    ],
  },
  {
    id: "banner",
    label: "Maison Notes",
    icon: <ImageIcon size={15} />,
    fields: [
      { key: "product_banner_image", label: "Image", type: "image" },
      { key: "product_banner_title", label: "Title" },
      { key: "product_banner_text", label: "Text", type: "textarea" },
    ],
  },
];

const productsSections: SectionDef[] = [
  {
    id: "products_banner",
    label: "Page Banner",
    icon: <ImageIcon size={15} />,
    fields: [
      { key: "products_page_banner_image", label: "Banner Image", type: "image" },
      { key: "products_page_title", label: "Title" },
      { key: "products_page_subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  {
    id: "product_trust",
    label: "Trust Badges",
    icon: <Shield size={15} />,
    fields: [{ key: "product_trust_badges", label: "Badges", type: "list" }],
  },
  {
    id: "product_shipping",
    label: "Shipping & Returns",
    icon: <Truck size={15} />,
    fields: [{ key: "product_shipping_text", label: "Text", type: "textarea" }],
  },
];

const templates: TemplateDef[] = [
  { id: "homepage", label: "Homepage", sections: homepageSections },
  { id: "products", label: "Products Page", sections: productsSections },
];

/* ── Main editor ──────────────────────────────────────────────────── */

export default function HomepageEditorPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("homepage");
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [hoveredSection, setHoveredSection] = useState<SectionId | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(6000);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [treeWidth, setTreeWidth] = useState(220);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  const currentTemplate = templates.find((t) => t.id === activeTemplate)!;
  const currentSection = currentTemplate.sections.find((s) => s.id === activeSection);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
        setTemplateMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const container = previewContainerRef.current;
    const content = previewContentRef.current;
    if (!container) return;

    function updateScale() {
      const containerWidth = container!.clientWidth;
      const scale = Math.min(containerWidth / 1440, 1);
      setPreviewScale(scale);
    }

    function updateHeight() {
      if (content) setContentHeight(content.scrollHeight);
    }

    updateScale();
    updateHeight();

    const ro = new ResizeObserver(() => {
      updateScale();
      updateHeight();
    });
    ro.observe(container);
    if (content) ro.observe(content);

    return () => ro.disconnect();
  }, [values, activeTemplate]);

  useEffect(() => {
    const firstSection = currentTemplate.sections[0];
    if (firstSection && !currentTemplate.sections.find((s) => s.id === activeSection)) {
      setActiveSection(firstSection.id);
    }
  }, [activeTemplate, currentTemplate, activeSection]);

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

  function onDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: treeWidth };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = ev.clientX - dragRef.current.startX;
      setTreeWidth(Math.max(160, Math.min(420, dragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const allKeys = new Set<string>();
      for (const template of templates) {
        for (const section of template.sections) {
          for (const field of section.fields) {
            allKeys.add(field.key);
          }
        }
      }
      await Promise.all(
        Array.from(allKeys).map((key) => updateSiteSetting(key, values[key] || ""))
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
      <div className="flex h-screen items-center justify-center bg-[#111]">
        <p className="text-sm uppercase tracking-[0.24em] text-white/40">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#111]">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center border-b border-[#2a2a2a] bg-[#111] px-4">
        {/* Left: Back */}
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-semibold uppercase tracking-[0.12em]">Online Store</span>
        </Link>

        {/* Center: Template selector */}
        <div className="flex flex-1 justify-center">
          <div className="relative" ref={templateMenuRef}>
            <button
              type="button"
              onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
              className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {currentTemplate.label}
              <ChevronDown size={14} className={`transition-transform ${templateMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {templateMenuOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-1 w-48 -translate-x-1/2 rounded-lg border border-[#333] bg-[#1a1a1a] py-1 shadow-xl">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTemplate(t.id);
                      setActiveSection(t.sections[0].id);
                      setTemplateMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition ${
                      activeTemplate === t.id
                        ? "bg-[var(--luxury-gold)]/10 text-[var(--luxury-gold)]"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t.id === "homepage" ? <LayoutTemplate size={14} /> : <List size={14} />}
                    {t.label}
                    {activeTemplate === t.id && <Check size={14} className="ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Save + status */}
        <div className="flex items-center gap-3">
          {message && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Check size={13} /> {message}
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <X size={13} /> {error}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-[var(--luxury-gold)] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-ink)] transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "Saving..." : <><Save size={13} /> Save</>}
          </button>
        </div>
      </div>

      {/* ── Body: sidebar (tree + settings) + preview ──────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Section tree + divider + Settings */}
        <div className="flex shrink-0 border-r border-[#2a2a2a] bg-[#0d0d0d]">
          {/* Section tree */}
          <div
            className="flex shrink-0 flex-col border-r border-[#2a2a2a] bg-[#0d0d0d]"
            style={{ width: treeWidth }}
          >
            <div className="border-b border-[#2a2a2a] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {currentTemplate.label}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
              {currentTemplate.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  onMouseEnter={() => setHoveredSection(section.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium transition ${
                    activeSection === section.id
                      ? "bg-[var(--luxury-gold)] text-[var(--luxury-ink)]"
                      : "text-white/50 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {section.icon}
                  <span className="truncate">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Draggable divider */}
          <div
            onMouseDown={onDividerMouseDown}
            className="group flex w-1 shrink-0 cursor-col-resize items-center justify-center bg-[#2a2a2a] transition hover:bg-[var(--luxury-gold)]/50"
          >
            <div className="h-8 w-0.5 rounded-full bg-white/20 group-hover:bg-white/50" />
          </div>

          {/* Settings panel */}
          <div className="flex w-[340px] shrink-0 flex-col bg-[#111]">
            {currentSection ? (
              <>
                <div className="border-b border-[#2a2a2a] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold)]">
                    {currentTemplate.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{currentSection.label}</p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
                  <div className="space-y-4">
                    {currentSection.fields.map((field) => {
                      if (field.type === "list") {
                        return (
                          <ListFieldEditor
                            key={field.key}
                            fieldKey={field.key}
                            label={field.label}
                            values={values}
                            update={update}
                          />
                        );
                      }
                      if (field.type === "object-list") {
                        return (
                          <ObjectListFieldEditor
                            key={field.key}
                            fieldKey={field.key}
                            label={field.label}
                            values={values}
                            update={update}
                          />
                        );
                      }
                      if (field.type === "product-picker") {
                        return (
                          <ProductPickerField
                            key={field.key}
                            fieldKey={field.key}
                            label={field.label}
                            values={values}
                            update={update}
                          />
                        );
                      }
                      return (
                        <label key={field.key} className="block">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                            {field.label}
                          </span>
                          {field.type === "textarea" ? (
                            <textarea
                              value={get(field.key)}
                              onChange={(e) => update(field.key, e.target.value)}
                              rows={3}
                              className="mt-1.5 w-full resize-none rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                          ) : field.type === "image" ? (
                            <ImageUploadField
                              value={get(field.key)}
                              onChange={(url) => update(field.key, url)}
                              className="mt-1.5"
                            />
                          ) : (
                            <input
                              type="text"
                              value={get(field.key)}
                              onChange={(e) => update(field.key, e.target.value)}
                              className="mt-1.5 h-10 w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-3 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-xs text-white/30">Select a section to edit</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div
          ref={previewContainerRef}
          className="relative flex-1 overflow-auto bg-[#1a1a1a]"
        >
          <div className="w-full overflow-hidden">
            <div
              style={{
                width: `${1440 * previewScale}px`,
                height: `${contentHeight * previewScale}px`,
              }}
            >
              <div
                ref={previewContentRef}
                style={{
                  width: 1440,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                {activeTemplate === "homepage" ? (
                  <HomepagePreview
                    get={get}
                    values={values}
                    activeSection={activeSection as HomepageSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                  />
                ) : (
                  <ProductsPagePreview
                    get={get}
                    values={values}
                    activeSection={activeSection as ProductsSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Custom Field Editors ─────────────────────────────────────────── */

function ListFieldEditor({
  fieldKey,
  label,
  values,
  update,
}: {
  fieldKey: string;
  label: string;
  values: Record<string, string>;
  update: (key: string, value: string) => void;
}) {
  let items: string[] = [];
  try {
    items = JSON.parse(values[fieldKey] || "[]");
  } catch {
    items = [];
  }

  function setItems(newItems: string[]) {
    update(fieldKey, JSON.stringify(newItems));
  }

  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
        {label}
      </span>
      <div className="mt-1.5 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical size={12} className="shrink-0 text-white/20" />
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = e.target.value;
                setItems(copy);
              }}
              className="h-9 flex-1 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-red-500/20 hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems([...items, ""])}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#444] text-xs text-white/40 transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
        >
          <Plus size={12} /> Add Item
        </button>
      </div>
    </div>
  );
}

function ObjectListFieldEditor({
  fieldKey,
  label,
  values,
  update,
}: {
  fieldKey: string;
  label: string;
  values: Record<string, string>;
  update: (key: string, value: string) => void;
}) {
  let items: { title: string; text: string }[] = [];
  try {
    items = JSON.parse(values[fieldKey] || "[]");
  } catch {
    items = [];
  }

  function setItems(newItems: { title: string; text: string }[]) {
    update(fieldKey, JSON.stringify(newItems));
  }

  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
        {label}
      </span>
      <div className="mt-1.5 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-[#333] bg-[#1a1a1a] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                Item {i + 1}
              </span>
              <button
                type="button"
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="text-white/40 transition hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <input
              type="text"
              value={item.title}
              placeholder="Title"
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], title: e.target.value };
                setItems(copy);
              }}
              className="h-9 w-full rounded-lg border border-[#333] bg-[#222] px-3 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
            />
            <textarea
              value={item.text}
              placeholder="Description"
              rows={2}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], text: e.target.value };
                setItems(copy);
              }}
              className="w-full resize-none rounded-lg border border-[#333] bg-[#222] px-3 py-2 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems([...items, { title: "", text: "" }])}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#444] text-xs text-white/40 transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
        >
          <Plus size={12} /> Add Promise
        </button>
      </div>
    </div>
  );
}

function ProductPickerField({
  fieldKey,
  label,
  values,
  update,
}: {
  fieldKey: string;
  label: string;
  values: Record<string, string>;
  update: (key: string, value: string) => void;
}) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);

  let selectedIds: string[] = [];
  try {
    selectedIds = JSON.parse(values[fieldKey] || "[]");
  } catch {
    selectedIds = [];
  }

  function setSelectedIds(ids: string[]) {
    update(fieldKey, JSON.stringify(ids));
  }

  useEffect(() => {
    productService
      .getAll()
      .then(setAllProducts)
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return allProducts;
    const q = search.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brandName?.toLowerCase().includes(q)
    );
  }, [allProducts, search]);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
        {label}
      </span>
      {selectedIds.length > 0 && (
        <p className="mt-1 text-[10px] text-white/30">
          {selectedIds.length} product{selectedIds.length !== 1 && "s"} selected &middot; empty = auto
        </p>
      )}
      <div className="mt-1.5 relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-[#333] bg-[#1a1a1a] pl-8 pr-3 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
        />
      </div>
      <div className="mt-2 max-h-[300px] space-y-1 overflow-y-auto rounded-lg border border-[#333] bg-[#1a1a1a] p-1.5 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
        {loadingProducts ? (
          <p className="py-4 text-center text-xs text-white/30">Loading products...</p>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-center text-xs text-white/30">No products found</p>
        ) : (
          filtered.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggle(product.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                  isSelected
                    ? "bg-[var(--luxury-gold)]/15 ring-1 ring-[var(--luxury-gold)]"
                    : "hover:bg-white/5"
                }`}
              >
                {product.images[0]?.imageUrl ? (
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-[#2a2a2a]">
                    <Image src={product.images[0].imageUrl} alt="" fill sizes="32px" className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="h-8 w-8 shrink-0 rounded bg-[#2a2a2a]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-white">{product.name}</p>
                  <p className="truncate text-[10px] text-white/40">{product.brandName}</p>
                </div>
                {isSelected && <Check size={14} className="shrink-0 text-[var(--luxury-gold)]" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Section Overlay ──────────────────────────────────────────────── */

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
          <Type size={10} /> {label}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Homepage Preview ─────────────────────────────────────────────── */

function HomepagePreview({
  get,
  values,
  activeSection,
  hoveredSection,
  onSelect,
  onHover,
}: {
  get: (key: string, fallback?: string) => string;
  values: Record<string, string>;
  activeSection: HomepageSectionId;
  hoveredSection: SectionId | null;
  onSelect: (id: SectionId) => void;
  onHover: (id: SectionId | null) => void;
}) {
  return (
    <>
      <SectionOverlay
        label="Hero"
        isActive={activeSection === "hero"}
        isHovered={hoveredSection === "hero"}
        onSelect={() => onSelect("hero")}
        onHover={(h) => onHover(h ? "hero" : null)}
      >
        <div className="relative h-[700px] overflow-hidden bg-[#1a1a1a]">
          {get("hero_image_url") && (
            <Image src={get("hero_image_url")} alt="Hero" fill sizes="1440px" className="object-cover" unoptimized />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,18,13,0.84)_0%,rgba(22,18,13,0.56)_42%,rgba(22,18,13,0.06)_100%)]" />
          <div className="relative flex h-full items-center px-12">
            <div className="max-w-2xl text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[var(--luxury-gold)]">Private Fragrance House</p>
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

      <SectionOverlay
        label="Value Bar"
        isActive={activeSection === "valuebar"}
        isHovered={hoveredSection === "valuebar"}
        onSelect={() => onSelect("valuebar")}
        onHover={(h) => onHover(h ? "valuebar" : null)}
      >
        <PreviewValueBar get={get} />
      </SectionOverlay>

      <section className="px-8 py-20">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">Enter the House</p>
              <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">Choose your ritual.</h2>
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">View all products</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionOverlay label="Category Panel 1" isActive={activeSection === "panel1"} isHovered={hoveredSection === "panel1"} onSelect={() => onSelect("panel1")} onHover={(h) => onHover(h ? "panel1" : null)}>
              <PreviewCategoryCard image={get("category_panel_1_image", "/home/home-fragrance.jpg")} eyebrow={get("category_panel_1_eyebrow", "Fragrance Wardrobe")} title={get("category_panel_1_title", "Perfumes, attars, and customised blends")} text={get("category_panel_1_text", "From saffroned warmth to smoky cedar...")} cta={get("category_panel_1_cta", "Shop Fragrance")} />
            </SectionOverlay>
            <SectionOverlay label="Category Panel 2" isActive={activeSection === "panel2"} isHovered={hoveredSection === "panel2"} onSelect={() => onSelect("panel2")} onHover={(h) => onHover(h ? "panel2" : null)}>
              <PreviewCategoryCard image={get("category_panel_2_image", "/home/home-skincare.jpg")} eyebrow={get("category_panel_2_eyebrow", "Skin Rituals")} title={get("category_panel_2_title", "Cleansers, creams, and polished care")} text={get("category_panel_2_text", "Soft-focus skincare essentials...")} cta={get("category_panel_2_cta", "Shop Skincare")} />
            </SectionOverlay>
          </div>
        </div>
      </section>

      <SectionOverlay label="Featured Products" isActive={activeSection === "featured"} isHovered={hoveredSection === "featured"} onSelect={() => onSelect("featured")} onHover={(h) => onHover(h ? "featured" : null)}>
        <section className="bg-[#efe3d0] px-8 py-20">
          <div className="mx-auto max-w-[1800px]">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">Featured Collection</p>
                <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">{get("featured_section_title", "Objects of desire.")}</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[var(--luxury-muted)]">{get("featured_section_subtitle", "A focused selection from the private labels now available in the store.")}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-[#d8c8ad] bg-[var(--luxury-paper)]">
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
      </SectionOverlay>

      <section className="px-8 py-20">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">Most Loved</p>
              <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">The best sellers.</h2>
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">View all</span>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[1/1.08] animate-pulse rounded-[var(--luxury-radius)] bg-[#efe3d0]" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#efe3d0] px-8 py-20">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">Just Arrived</p>
              <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">New arrivals.</h2>
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">Explore new</span>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[1/1.08] animate-pulse rounded-[var(--luxury-radius)] bg-[#ead9c0]" />
            ))}
          </div>
        </div>
      </section>

      <SectionOverlay label="Quote" isActive={activeSection === "quote"} isHovered={hoveredSection === "quote"} onSelect={() => onSelect("quote")} onHover={(h) => onHover(h ? "quote" : null)}>
        <section className="relative overflow-hidden bg-[var(--luxury-ink)] px-8 py-28 text-[var(--luxury-paper)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(182,138,66,0.14)_0%,rgba(22,18,13,0)_68%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <span aria-hidden className="block text-7xl leading-[0.6] text-[var(--luxury-gold)] [font-family:var(--font-serif)]">&ldquo;</span>
            <blockquote className="mt-4 text-4xl font-normal leading-relaxed [font-family:var(--font-serif)]">
              {get("quote_text", "A fragrance should be worn like a signature — quietly, deliberately, and entirely your own.")}
            </blockquote>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
              {get("quote_attribution", "The House Motto")}
            </p>
          </div>
        </section>
      </SectionOverlay>

      <SectionOverlay label="Maison Notes" isActive={activeSection === "banner"} isHovered={hoveredSection === "banner"} onSelect={() => onSelect("banner")} onHover={(h) => onHover(h ? "banner" : null)}>
        <section className="px-8 py-20">
          <div className="mx-auto grid max-w-[1800px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative aspect-[3/2] overflow-hidden bg-[#efe0ca]">
              {get("product_banner_image") ? (
                <Image src={get("product_banner_image")} alt={get("product_banner_title", "Banner")} fill sizes="720px" className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--luxury-muted)]">No banner image</div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">Maison Notes</p>
              <h2 className="mt-3 text-6xl font-normal leading-tight [font-family:var(--font-serif)]">{get("product_banner_title", "A storefront for house labels that still feels tactile.")}</h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">{get("product_banner_text", "The collection is staged like a real luxury catalogue.")}</p>
            </div>
          </div>
        </section>
      </SectionOverlay>

      <SectionOverlay label="House Promises" isActive={activeSection === "promises"} isHovered={hoveredSection === "promises"} onSelect={() => onSelect("promises")} onHover={(h) => onHover(h ? "promises" : null)}>
        <section className="border-y border-[#d8c8ad] bg-[var(--luxury-paper)] px-8 py-16">
          <div className="mx-auto grid max-w-[1800px] gap-8 md:grid-cols-3">
            {(() => {
              let promises: { title: string; text: string }[] = [];
              try { promises = JSON.parse(values["house_promises"] || "[]"); } catch { /* */ }
              if (promises.length === 0) promises = [
                { title: "Curated Discovery", text: "Shop by gender, category, or house without losing the boutique feel." },
                { title: "Quiet Product Detail", text: "Large visuals, variant choices, wishlist controls, and cart previews keep the flow focused." },
                { title: "Ritual Ready", text: "Fragrance and skincare now share one polished visual language across the store." },
              ];
              return promises.map((p, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-gold-strong)]">{p.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">{p.text}</p>
                </div>
              ));
            })()}
          </div>
        </section>
      </SectionOverlay>

      <SectionOverlay label="Newsletter" isActive={activeSection === "newsletter"} isHovered={hoveredSection === "newsletter"} onSelect={() => onSelect("newsletter")} onHover={(h) => onHover(h ? "newsletter" : null)}>
        <section className="bg-[#efe3d0] px-8 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">The List</p>
            <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">{get("newsletter_title", "Letters from the house.")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--luxury-muted)]">{get("newsletter_subtitle", "New releases, private previews, and quiet notes on the collection.")}</p>
            <div className="mx-auto mt-8 flex max-w-md gap-3">
              <div className="h-12 flex-1 rounded-full border border-[#d8c8ad] bg-[var(--luxury-input)]" />
              <div className="h-12 w-28 rounded-full bg-[var(--luxury-ink)]" />
            </div>
          </div>
        </section>
      </SectionOverlay>

      <SectionOverlay label="Bottom CTA" isActive={activeSection === "cta"} isHovered={hoveredSection === "cta"} onSelect={() => onSelect("cta")} onHover={(h) => onHover(h ? "cta" : null)}>
        <section className="px-8 py-28 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">Begin Again</p>
            <h2 className="mt-3 text-6xl font-normal [font-family:var(--font-serif)]">{get("cta_title", "Find the next signature.")}</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--luxury-muted)]">{get("cta_subtitle", "Browse perfumes, attars, customised blends, face washes, creams, and nail care from the new house catalogue.")}</p>
            <span className="mt-8 inline-flex rounded-full bg-[var(--luxury-ink)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-paper)]">{get("cta_button_text", "Shop the Archive")}</span>
          </div>
        </section>
      </SectionOverlay>
    </>
  );
}

function PreviewValueBar({ get }: { get: (key: string, fallback?: string) => string }) {
  let items: string[] = [];
  try { items = JSON.parse(get("value_bar_items", "[]")); } catch { /* */ }
  if (items.length === 0) items = ["Cloud-like skincare", "Amber-rich attars", "Genderless signatures", "Private house labels"];
  return (
    <div className="border-y border-[#d8c8ad] bg-[rgba(255,250,242,0.72)] px-6 py-5 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1800px] gap-4 text-center text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxury-muted)] md:grid-cols-4">
        {items.map((item, i) => <span key={i}>{item}</span>)}
      </div>
    </div>
  );
}

function PreviewCategoryCard({ image, eyebrow, title, text, cta }: { image: string; eyebrow: string; title: string; text: string; cta: string }) {
  return (
    <div className="group block">
      <div className="relative min-h-[560px] overflow-hidden">
        <Image src={image} alt={title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" unoptimized />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,18,13,0.1)_0%,rgba(22,18,13,0.48)_48%,rgba(22,18,13,0.86)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="inline-flex bg-[rgba(22,18,13,0.58)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#f1c778] shadow-[0_12px_30px_rgba(22,18,13,0.28)] backdrop-blur-sm">{eyebrow}</p>
          <h3 className="mt-3 text-4xl font-normal leading-tight [font-family:var(--font-serif)]">{title}</h3>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/76">{text}</p>
          <span className="mt-6 inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold)]">{cta}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Products Page Preview ─────────────────────────────────────────── */

function ProductsPagePreview({
  get,
  values,
  activeSection,
  hoveredSection,
  onSelect,
  onHover,
}: {
  get: (key: string, fallback?: string) => string;
  values: Record<string, string>;
  activeSection: ProductsSectionId;
  hoveredSection: SectionId | null;
  onSelect: (id: SectionId) => void;
  onHover: (id: SectionId | null) => void;
}) {
  let trustBadges: string[] = [];
  try { trustBadges = JSON.parse(values["product_trust_badges"] || "[]"); } catch { /* */ }
  if (trustBadges.length === 0) trustBadges = ["100% authentic products", "Free shipping on eligible orders", "Secure payments", "Easy returns and support"];

  const shippingText = get("product_shipping_text", "Orders are packed carefully and shipped securely. Return and exchange rules can be added here later.");
  const trustIcons = [Shield, Truck, Lock, RotateCcw];

  return (
    <div className="bg-[var(--luxury-ivory)]">
      {/* Page banner - editable */}
      <SectionOverlay
        label="Page Banner"
        isActive={activeSection === "products_banner"}
        isHovered={hoveredSection === "products_banner"}
        onSelect={() => onSelect("products_banner")}
        onHover={(h) => onHover(h ? "products_banner" : null)}
      >
        <section className="relative h-[340px] overflow-hidden bg-[#1a1a1a]">
          {get("products_page_banner_image") && (
            <Image
              src={get("products_page_banner_image")}
              alt="Products"
              fill
              sizes="1440px"
              className="object-cover"
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,18,13,0.2)_0%,rgba(22,18,13,0.65)_100%)]" />
          <div className="relative flex h-full items-center px-12">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl font-normal [font-family:var(--font-serif)]">
                {get("products_page_title", "Discover the Collection")}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-white/78">
                {get("products_page_subtitle", "Browse perfumes, attars, skincare, and daily essentials from the private house labels.")}
              </p>
            </div>
          </div>
        </section>
      </SectionOverlay>

      {/* Search/filter bar */}
      <section className="border-b border-[#d8c8ad] bg-[var(--luxury-paper)] px-8 py-4">
        <div className="mx-auto flex max-w-[1800px] items-center gap-4">
          <div className="h-10 flex-1 rounded-full border border-[#d8c8ad] bg-[var(--luxury-input)]" />
          <div className="flex gap-2">
            {["All", "Men", "Women", "Unisex"].map((g) => (
              <span key={g} className="rounded-full border border-[#d8c8ad] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--luxury-muted)]">
                {g}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="px-8 py-10">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-6 text-sm text-[var(--luxury-muted)]">
            Showing 12 products
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-[#d8c8ad] bg-[var(--luxury-paper)]">
                <div className="aspect-[1/1.08] animate-pulse bg-[#efe3d0]" />
                <div className="flex flex-col gap-2 p-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-[#e5d9c4]" />
                  <div className="h-5 w-32 animate-pulse rounded bg-[#e5d9c4]" />
                  <div className="h-4 w-16 animate-pulse rounded bg-[#e5d9c4]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges - shared with product detail */}
      <SectionOverlay
        label="Trust Badges"
        isActive={activeSection === "product_trust"}
        isHovered={hoveredSection === "product_trust"}
        onSelect={() => onSelect("product_trust")}
        onHover={(h) => onHover(h ? "product_trust" : null)}
      >
        <section className="border-t border-[#d8c8ad] bg-[var(--luxury-paper)] px-8 py-8">
          <div className="mx-auto grid max-w-[1800px] gap-4 sm:grid-cols-2 md:grid-cols-4">
            {trustBadges.map((badge, i) => {
              const Icon = trustIcons[i % trustIcons.length];
              return (
                <div key={i} className="flex items-center gap-3 text-sm text-[var(--luxury-muted)]">
                  <Icon size={18} />
                  <span>{badge}</span>
                </div>
              );
            })}
          </div>
        </section>
      </SectionOverlay>

      {/* Shipping - shared with product detail */}
      <SectionOverlay
        label="Shipping & Returns"
        isActive={activeSection === "product_shipping"}
        isHovered={hoveredSection === "product_shipping"}
        onSelect={() => onSelect("product_shipping")}
        onHover={(h) => onHover(h ? "product_shipping" : null)}
      >
        <section className="border-t border-[#d8c8ad] px-8 py-8">
          <div className="mx-auto max-w-[1800px]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">Shipping & Returns</span>
              <ChevronDown size={18} className="text-[var(--luxury-muted)]" />
            </div>
            <div className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
              {shippingText}
            </div>
          </div>
        </section>
      </SectionOverlay>
    </div>
  );
}
