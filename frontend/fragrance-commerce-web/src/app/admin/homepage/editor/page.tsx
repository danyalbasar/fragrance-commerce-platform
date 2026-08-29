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
  TrendingUp,
  Sparkles,
  Building2,
  EyeOff,
  Truck,
  RotateCcw,
  Lock,
  Phone,
  MapPin,
  MessageSquare,
  HelpCircle,
  FileText,
  KeyRound,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import {
  getSiteSetting,
  getSiteSettings,
  updateSiteSetting,
} from "@/services/siteSettingsService";
import { productService } from "@/services/productService";
import ImageUploadField from "@/components/common/ImageUploadField";
import type { Product } from "@/types/product";

/* â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

type TemplateId =
  | "homepage"
  | "products"
  | "product-detail"
  | "contact"
  | "faq"
  | "privacy"
  | "return"
  | "terms"
  | "login"
  | "signup"
  | "not-found";

type HomepageSectionId =
  | "hero"
  | "valuebar"
  | "panels"
  | "panel1"
  | "panel2"
  | "featured"
  | "best_sellers"
  | "new_arrivals"
  | "brands"
  | "quote"
  | "promises"
  | "newsletter"
  | "cta"
  | "banner";

type ProductsSectionId = "products_banner";

type ProductDetailSectionId = "pdp_trust" | "pdp_shipping" | "pdp_similar";

type ContactSectionId = "contact_content";

type InfoPageSectionId = "info_content";

type AuthSectionId = "auth_brand";

type NotFoundSectionId = "not_found_content";

type SectionId =
  | HomepageSectionId
  | ProductsSectionId
  | ProductDetailSectionId
  | ContactSectionId
  | InfoPageSectionId
  | AuthSectionId
  | NotFoundSectionId;

type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "list"
  | "object-list"
  | "product-picker"
  | "link";

interface Field {
  key: string;
  label: string;
  type?: FieldType;
  options?: { label: string; value: string }[];
  objectKeys?: { k1: string; k2: string; label1: string; label2: string; addLabel: string };
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

/* â”€â”€ Section definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const linkOptions = [
  { label: "Home", value: "/" },
  { label: "All Products", value: "/products" },
  { label: "Men's Fragrance", value: "/products?gender=Men" },
  { label: "Women's Fragrance", value: "/products?gender=Women" },
  { label: "Unisex Fragrance", value: "/products?gender=Unisex" },
  { label: "Perfumes", value: "/products?category=Perfume" },
  { label: "Attars", value: "/products?category=Attar" },
  { label: "Face Wash", value: "/products?category=Face%20Wash" },
  { label: "Skincare", value: "/products?category=Fairness%20Cream" },
  { label: "Contact", value: "/contact" },
  { label: "FAQ", value: "/faq" },
  { label: "Privacy Policy", value: "/privacy-policy" },
  { label: "Return Policy", value: "/return-policy" },
  { label: "Terms & Conditions", value: "/terms-and-conditions" },
];

const homepageSections: SectionDef[] = [
  {
    id: "hero",
    label: "Hero",
    icon: <LayoutTemplate size={15} />,
    fields: [
      { key: "hero_image_url", label: "Background Image", type: "image" },
      { key: "hero_eyebrow", label: "Eyebrow" },
      { key: "hero_title", label: "Title" },
      { key: "hero_subtitle", label: "Subtitle", type: "textarea" },
      { key: "hero_cta_text", label: "Primary CTA Text" },
      { key: "hero_cta_link", label: "Primary CTA Link", type: "link", options: linkOptions },
      { key: "hero_secondary_cta_text", label: "Secondary CTA Text" },
      { key: "hero_secondary_cta_link", label: "Secondary CTA Link", type: "link", options: linkOptions },
    ],
  },
  {
    id: "valuebar",
    label: "Value Bar",
    icon: <List size={15} />,
    fields: [{ key: "value_bar_items", label: "Items", type: "list" }],
  },
  {
    id: "panels",
    label: "Category Panels",
    icon: <MousePointer2 size={15} />,
    fields: [
      { key: "categories_eyebrow", label: "Eyebrow" },
      { key: "categories_title", label: "Title" },
      { key: "categories_link_text", label: "Link Text" },
    ],
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
      { key: "category_panel_1_link", label: "Link", type: "link", options: linkOptions },
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
      { key: "category_panel_2_link", label: "Link", type: "link", options: linkOptions },
      { key: "category_panel_2_cta", label: "CTA Text" },
    ],
  },
  {
    id: "featured",
    label: "Featured Products",
    icon: <Star size={15} />,
    fields: [
      { key: "featured_eyebrow", label: "Section Eyebrow" },
      { key: "featured_section_title", label: "Section Title" },
      { key: "featured_section_subtitle", label: "Section Subtitle", type: "textarea" },
      { key: "featured_product_ids", label: "Select Products", type: "product-picker" },
    ],
  },
  {
    id: "best_sellers",
    label: "Best Sellers",
    icon: <TrendingUp size={15} />,
    fields: [
      { key: "best_sellers_eyebrow", label: "Eyebrow" },
      { key: "best_sellers_title", label: "Title" },
      { key: "best_sellers_link_text", label: "Link Text" },
    ],
  },
  {
    id: "new_arrivals",
    label: "New Arrivals",
    icon: <Sparkles size={15} />,
    fields: [
      { key: "new_arrivals_eyebrow", label: "Eyebrow" },
      { key: "new_arrivals_title", label: "Title" },
      { key: "new_arrivals_link_text", label: "Link Text" },
    ],
  },
  {
    id: "brands",
    label: "Brands Strip",
    icon: <Building2 size={15} />,
    fields: [{ key: "brands_eyebrow", label: "Eyebrow" }],
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
    id: "banner",
    label: "Maison Notes",
    icon: <ImageIcon size={15} />,
    fields: [
      { key: "product_banner_image", label: "Image", type: "image" },
      { key: "maison_notes_eyebrow", label: "Eyebrow" },
      { key: "product_banner_title", label: "Title" },
      { key: "product_banner_text", label: "Text", type: "textarea" },
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
      { key: "newsletter_eyebrow", label: "Eyebrow" },
      { key: "newsletter_title", label: "Title" },
      { key: "newsletter_subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  {
    id: "cta",
    label: "Bottom CTA",
    icon: <Megaphone size={15} />,
    fields: [
      { key: "cta_eyebrow", label: "Eyebrow" },
      { key: "cta_title", label: "Title" },
      { key: "cta_subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_button_text", label: "Button Text" },
      { key: "cta_button_link", label: "Button Link", type: "link", options: linkOptions },
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
      { key: "products_eyebrow", label: "Eyebrow" },
    ],
  },
];

const productDetailSections: SectionDef[] = [
  {
    id: "pdp_trust",
    label: "Trust Badges",
    icon: <Shield size={15} />,
    fields: [{ key: "product_trust_badges", label: "Badges", type: "list" }],
  },
  {
    id: "pdp_similar",
    label: "Similar Products",
    icon: <Sparkles size={15} />,
    fields: [{ key: "pdp_similar_eyebrow", label: "Eyebrow" }],
  },
  {
    id: "pdp_shipping",
    label: "Shipping & Returns",
    icon: <Truck size={15} />,
    fields: [{ key: "product_shipping_text", label: "Text", type: "textarea" }],
  },
];

const contactSections: SectionDef[] = [
  {
    id: "contact_content",
    label: "Contact Info",
    icon: <Mail size={15} />,
    fields: [
      { key: "contact_eyebrow", label: "Eyebrow" },
      { key: "contact_heading", label: "Heading" },
      { key: "contact_description", label: "Description", type: "textarea" },
      { key: "contact_email", label: "Email" },
      { key: "contact_phone", label: "Phone" },
      { key: "contact_address", label: "Address" },
      { key: "contact_response_label", label: "Response Time Label" },
      { key: "contact_response_text", label: "Response Time Text", type: "textarea" },
    ],
  },
];

const faqSections: SectionDef[] = [
  {
    id: "info_content",
    label: "FAQ Content",
    icon: <HelpCircle size={15} />,
    fields: [
      { key: "faq_eyebrow", label: "Eyebrow" },
      { key: "faq_title", label: "Title" },
      { key: "faq_intro", label: "Intro", type: "textarea" },
      {
        key: "faq_sections",
        label: "Q&A Sections",
        type: "object-list",
        objectKeys: {
          k1: "question",
          k2: "answer",
          label1: "Question",
          label2: "Answer",
          addLabel: "Add Question",
        },
      },
    ],
  },
];

const privacySections: SectionDef[] = [
  {
    id: "info_content",
    label: "Privacy Content",
    icon: <Shield size={15} />,
    fields: [
      { key: "privacy_eyebrow", label: "Eyebrow" },
      { key: "privacy_title", label: "Title" },
      { key: "privacy_intro", label: "Intro", type: "textarea" },
      { key: "privacy_sections", label: "Sections", type: "object-list", objectKeys: { k1: "title", k2: "body", label1: "Title", label2: "Body", addLabel: "Add Section" } },
    ],
  },
];

const returnSections: SectionDef[] = [
  {
    id: "info_content",
    label: "Return Content",
    icon: <RotateCcw size={15} />,
    fields: [
      { key: "return_eyebrow", label: "Eyebrow" },
      { key: "return_title", label: "Title" },
      { key: "return_intro", label: "Intro", type: "textarea" },
      { key: "return_sections", label: "Sections", type: "object-list", objectKeys: { k1: "title", k2: "body", label1: "Title", label2: "Body", addLabel: "Add Section" } },
    ],
  },
];

const termsSections: SectionDef[] = [
  {
    id: "info_content",
    label: "Terms Content",
    icon: <FileText size={15} />,
    fields: [
      { key: "terms_eyebrow", label: "Eyebrow" },
      { key: "terms_title", label: "Title" },
      { key: "terms_intro", label: "Intro", type: "textarea" },
      { key: "terms_sections", label: "Sections", type: "object-list", objectKeys: { k1: "title", k2: "body", label1: "Title", label2: "Body", addLabel: "Add Section" } },
    ],
  },
];

const loginSections: SectionDef[] = [
  {
    id: "auth_brand",
    label: "Brand Panel",
    icon: <KeyRound size={15} />,
    fields: [
      { key: "login_eyebrow", label: "Eyebrow" },
      { key: "login_form_eyebrow", label: "Form Eyebrow" },
      { key: "login_brand_title", label: "Title" },
      { key: "login_brand_description", label: "Description", type: "textarea" },
    ],
  },
];

const signupSections: SectionDef[] = [
  {
    id: "auth_brand",
    label: "Brand Panel",
    icon: <UserPlus size={15} />,
    fields: [
      { key: "signup_eyebrow", label: "Eyebrow" },
      { key: "signup_form_eyebrow", label: "Form Eyebrow" },
      { key: "signup_brand_title", label: "Title" },
      { key: "signup_brand_description", label: "Description", type: "textarea" },
    ],
  },
];

const notFoundSections: SectionDef[] = [
  {
    id: "not_found_content",
    label: "404 Content",
    icon: <AlertTriangle size={15} />,
    fields: [
      { key: "not_found_eyebrow", label: "Eyebrow" },
      { key: "not_found_title", label: "Headline" },
      { key: "not_found_description", label: "Description", type: "textarea" },
    ],
  },
];

const templates: TemplateDef[] = [
  { id: "homepage", label: "Homepage", sections: homepageSections },
  { id: "products", label: "Products Page", sections: productsSections },
  { id: "product-detail", label: "Product Detail", sections: productDetailSections },
  { id: "contact", label: "Contact", sections: contactSections },
  { id: "faq", label: "FAQ", sections: faqSections },
  { id: "privacy", label: "Privacy Policy", sections: privacySections },
  { id: "return", label: "Return Policy", sections: returnSections },
  { id: "terms", label: "Terms & Conditions", sections: termsSections },
  { id: "login", label: "Login", sections: loginSections },
  { id: "signup", label: "Signup", sections: signupSections },
  { id: "not-found", label: "404 Page", sections: notFoundSections },
];

/* â”€â”€ Main editor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
    if (!container) return;
    let raf = 0;

    function updateScale() {
      const scale = Math.min(container!.clientWidth / 1440, 1);
      setPreviewScale((prev) => (prev === scale ? prev : scale));
    }

    updateScale();

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateScale);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [values, activeTemplate]);

  useEffect(() => {
    const content = previewContentRef.current;
    if (!content) return;
    let raf = requestAnimationFrame(() => {
      const h = content.scrollHeight;
      setContentHeight((prev) => (prev === h ? prev : h));
    });
    return () => cancelAnimationFrame(raf);
  }, [values, activeTemplate, previewScale]);

  useEffect(() => {
    const firstSection = currentTemplate.sections[0];
    if (firstSection && !currentTemplate.sections.find((s) => s.id === activeSection)) {
      setActiveSection(firstSection.id);
    }
  }, [activeTemplate, currentTemplate, activeSection]);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`[data-section="${activeSection}"]`);
    if (!target) return;
    const scale = previewScale || 1;
    const top = Math.max(0, target.offsetTop * scale - 12);
    container.scrollTo({ top, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, activeTemplate]);

  async function loadSettings() {
    try {
      const settings = await getSiteSettings();
      const map: Record<string, string> = {};
      settings.forEach((s) => {
        map[s.key] = s.value;
      });
      let featuredIds: string[] = [];
      try {
        featuredIds = JSON.parse(map["featured_product_ids"] || "[]");
      } catch {
        featuredIds = [];
      }
      if (!Array.isArray(featuredIds) || featuredIds.length === 0) {
        try {
          const [allProducts, houseBrandsRaw] = await Promise.all([
            productService.getAll(),
            getSiteSetting("house_brands").catch(() => null),
          ]);
          const houseBrands: string[] = houseBrandsRaw?.value
            ? (JSON.parse(houseBrandsRaw.value) as string[])
            : [];
          const inStock = allProducts.filter(
            (product) =>
              product.images.length > 0 &&
              product.variants.some((variant) => variant.stockQuantity > 0)
          );
          const autoPicked = houseBrands.length > 0
            ? houseBrands
                .map((brand) => inStock.find((product) => product.brandName === brand))
                .filter((product): product is typeof allProducts[0] => Boolean(product))
            : [];
          const chosen = (autoPicked.length > 0 ? autoPicked : inStock).slice(0, 3);
          if (chosen.length > 0) {
            const ids = chosen.map((p) => p.id);
            map["featured_product_ids"] = JSON.stringify(ids);
            updateSiteSetting("featured_product_ids", JSON.stringify(ids)).catch(() => {});
          }
        } catch {
          /* keep empty */
        }
      }
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

function ProductDetailPreview({
  get,
  values,
  activeSection,
  hoveredSection,
  onSelect,
  onHover,
}: {
  get: (key: string, fallback?: string) => string;
  values: Record<string, string>;
  activeSection: ProductDetailSectionId;
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
      {/* Mock product detail hero */}
      <section className="flex gap-10 bg-white px-12 py-10">
        <div className="h-[420px] w-[400px] shrink-0 animate-pulse bg-[#efe3d0]" />
        <div className="flex flex-1 flex-col justify-center gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-[#e5d9c4]" />
          <div className="h-8 w-72 animate-pulse rounded bg-[#e5d9c4]" />
          <div className="h-5 w-20 animate-pulse rounded bg-[#e5d9c4]" />
          <div className="h-4 w-96 animate-pulse rounded bg-[#e5d9c4]" />
          <div className="mt-4 h-12 w-48 rounded-full bg-[var(--luxury-gold)]/20" />
        </div>
      </section>

      {/* Similar products */}
      <SectionOverlay
        label="Similar Products"
        isActive={activeSection === "pdp_similar"}
        isHovered={hoveredSection === "pdp_similar"}
        sectionId="pdp_similar"
        onSelect={() => onSelect("pdp_similar")}
        onHover={(h) => onHover(h ? "pdp_similar" : null)}
      >
        <section className="border-t border-[#d8c8ad] px-8 py-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                  {get("pdp_similar_eyebrow", "You May Also Like")}
                </p>
                <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl">
                  More products like this
                </h2>
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">
                View similar
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[1/1.08] animate-pulse rounded-[var(--luxury-radius)] bg-[#efe3d0]" />
              ))}
            </div>
          </div>
        </section>
      </SectionOverlay>

      {/* Trust badges */}
      <SectionOverlay
        label="Trust Badges"
        isActive={activeSection === "pdp_trust"}
        isHovered={hoveredSection === "pdp_trust"}
        sectionId="pdp_trust"
        onSelect={() => onSelect("pdp_trust")}
        onHover={(h) => onHover(h ? "pdp_trust" : null)}
      >
        <section className="border-t border-[#d8c8ad] bg-[var(--luxury-paper)] px-8 py-8">
          <div className="mx-auto grid max-w-[1440px] gap-4 sm:grid-cols-2 md:grid-cols-4">
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

      {/* Shipping & Returns */}
      <SectionOverlay
        label="Shipping & Returns"
        isActive={activeSection === "pdp_shipping"}
        isHovered={hoveredSection === "pdp_shipping"}
        sectionId="pdp_shipping"
        onSelect={() => onSelect("pdp_shipping")}
        onHover={(h) => onHover(h ? "pdp_shipping" : null)}
      >
        <section className="border-t border-[#d8c8ad] px-8 py-8">
          <div className="mx-auto max-w-[1440px]">
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#111]">
      {/* â”€â”€ Top bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ Body: sidebar (tree + settings) + preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                            objectKeys={field.objectKeys}
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
                      if (field.type === "link") {
                        return (
                          <label key={field.key} className="block">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                              {field.label}
                            </span>
                            <select
                              value={get(field.key)}
                              onChange={(e) => update(field.key, e.target.value)}
                              className="mt-1.5 h-10 w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-3 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
                            >
                              <option value="">Select a page...</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </label>
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
          style={{ scrollbarGutter: "stable" }}
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
                ) : activeTemplate === "products" ? (
                  <ProductsPagePreview
                    get={get}
                    values={values}
                    activeSection={activeSection as ProductsSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                  />
                ) : activeTemplate === "product-detail" ? (
                  <ProductDetailPreview
                    get={get}
                    values={values}
                    activeSection={activeSection as ProductDetailSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                  />
                ) : activeTemplate === "contact" ? (
                  <ContactPreview
                    get={get}
                    values={values}
                    activeSection={activeSection as ContactSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                  />
                ) : activeTemplate === "faq" ? (
                  <InfoPagePreview
                    get={get}
                    prefix="faq"
                    activeSection={activeSection as InfoPageSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                    sectionType="question"
                  />
                ) : activeTemplate === "privacy" ? (
                  <InfoPagePreview
                    get={get}
                    prefix="privacy"
                    activeSection={activeSection as InfoPageSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                    sectionType="title"
                  />
                ) : activeTemplate === "return" ? (
                  <InfoPagePreview
                    get={get}
                    prefix="return"
                    activeSection={activeSection as InfoPageSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                    sectionType="title"
                  />
                ) : activeTemplate === "terms" ? (
                  <InfoPagePreview
                    get={get}
                    prefix="terms"
                    activeSection={activeSection as InfoPageSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                    sectionType="title"
                  />
                ) : activeTemplate === "login" ? (
                  <AuthPreview
                    get={get}
                    prefix="login"
                    activeSection={activeSection as AuthSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                  />
                ) : activeTemplate === "signup" ? (
                  <AuthPreview
                    get={get}
                    prefix="signup"
                    activeSection={activeSection as AuthSectionId}
                    hoveredSection={hoveredSection}
                    onSelect={(id) => setActiveSection(id)}
                    onHover={setHoveredSection}
                  />
                ) : (
                  <NotFoundPreview
                    get={get}
                    activeSection={activeSection as NotFoundSectionId}
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

/* â”€â”€ Custom Field Editors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
  objectKeys,
}: {
  fieldKey: string;
  label: string;
  values: Record<string, string>;
  update: (key: string, value: string) => void;
  objectKeys?: { k1: string; k2: string; label1: string; label2: string; addLabel: string };
}) {
  const k1 = objectKeys?.k1 ?? "title";
  const k2 = objectKeys?.k2 ?? "text";
  const label1 = objectKeys?.label1 ?? "Title";
  const label2 = objectKeys?.label2 ?? "Text";
  const addLabel = objectKeys?.addLabel ?? "Add Promise";
  const items = loadItems(values[fieldKey]);

  function setItems(newItems: Record<string, string>[]) {
    update(fieldKey, JSON.stringify(newItems));
  }

  function loadItems(v: string): Record<string, string>[] {
    try {
      const parsed = JSON.parse(v || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
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
              value={item[k1] ?? ""}
              placeholder={label1}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], [k1]: e.target.value };
                setItems(copy);
              }}
              className="h-9 w-full rounded-lg border border-[#333] bg-[#222] px-3 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
            />
            <textarea
              value={item[k2] ?? ""}
              placeholder={label2}
              rows={2}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], [k2]: e.target.value };
                setItems(copy);
              }}
              className="w-full resize-none rounded-lg border border-[#333] bg-[#222] px-3 py-2 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems([...items, { [k1]: "", [k2]: "" }])}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#444] text-xs text-white/40 transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
        >
          <Plus size={12} /> {addLabel}
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
      {selectedIds.length > 0 && (
        <div className="mt-2 space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Selected
          </span>
          {allProducts
            .filter((p) => selectedIds.includes(p.id))
            .map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2 rounded-lg border border-[var(--luxury-gold)]/40 bg-[var(--luxury-gold)]/10 px-2 py-1.5"
              >
                {product.images[0]?.imageUrl ? (
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded bg-[#2a2a2a]">
                    <Image src={product.images[0].imageUrl} alt="" fill sizes="28px" className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="h-7 w-7 shrink-0 rounded bg-[#2a2a2a]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] text-white">{product.name}</p>
                  <p className="truncate text-[10px] text-white/40">{product.brandName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  title="Remove"
                  className="shrink-0 text-white/40 transition hover:text-red-400"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
        </div>
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

/* â”€â”€ Section Overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function SectionOverlay({
  sectionId,
  label,
  isActive,
  isHovered,
  onSelect,
  onHover,
  children,
}: {
  sectionId: string;
  label: string;
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      data-section={sectionId}
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

/* â”€â”€ Homepage Preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    let ids: string[] = [];
    try {
      ids = JSON.parse(values["featured_product_ids"] || "[]");
    } catch {
      ids = [];
    }
    if (!Array.isArray(ids) || ids.length === 0) {
      setFeaturedProducts([]);
      return () => {
        active = false;
      };
    }
    Promise.all(ids.map((id: string) => productService.getById(id)))
      .then((products) => {
        if (active) setFeaturedProducts(products.filter((p) => !!p && !!p.images?.[0]?.imageUrl));
      })
      .catch(() => {
        if (active) setFeaturedProducts([]);
      });
    return () => {
      active = false;
    };
  }, [values["featured_product_ids"]]);

  return (
    <div className="bg-[var(--luxury-ivory)]">
      <SectionOverlay
        label="Hero"
        isActive={activeSection === "hero"}
        isHovered={hoveredSection === "hero"}
        sectionId="hero"
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
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[var(--luxury-gold)]">{get("hero_eyebrow", "Private Fragrance House")}</p>
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
        sectionId="valuebar"
        onSelect={() => onSelect("valuebar")}
        onHover={(h) => onHover(h ? "valuebar" : null)}
      >
        <PreviewValueBar get={get} />
      </SectionOverlay>

      <section className="px-8 py-20">
        <div className="mx-auto max-w-[1800px]">
          <SectionOverlay sectionId="panels" label="Category Panels" isActive={activeSection === "panels"} isHovered={hoveredSection === "panels"} onSelect={() => onSelect("panels")} onHover={(h) => onHover(h ? "panels" : null)}>
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
<p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">{get("categories_eyebrow", "Enter the House")}</p>
<h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">{get("categories_title", "Choose your ritual.")}</h2>
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">{get("categories_link_text", "View all products")}</span>
            </div>
          </SectionOverlay>
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionOverlay sectionId="panel1" label="Category Panel 1" isActive={activeSection === "panel1"} isHovered={hoveredSection === "panel1"} onSelect={() => onSelect("panel1")} onHover={(h) => onHover(h ? "panel1" : null)}>
              <PreviewCategoryCard image={get("category_panel_1_image", "/home/home-fragrance.jpg")} eyebrow={get("category_panel_1_eyebrow", "Fragrance Wardrobe")} title={get("category_panel_1_title", "Perfumes, attars, and customised blends")} text={get("category_panel_1_text", "From saffroned warmth to smoky cedar...")} cta={get("category_panel_1_cta", "Shop Fragrance")} />
            </SectionOverlay>
            <SectionOverlay sectionId="panel2" label="Category Panel 2" isActive={activeSection === "panel2"} isHovered={hoveredSection === "panel2"} onSelect={() => onSelect("panel2")} onHover={(h) => onHover(h ? "panel2" : null)}>
              <PreviewCategoryCard image={get("category_panel_2_image", "/home/home-skincare.jpg")} eyebrow={get("category_panel_2_eyebrow", "Skin Rituals")} title={get("category_panel_2_title", "Cleansers, creams, and polished care")} text={get("category_panel_2_text", "Soft-focus skincare essentials...")} cta={get("category_panel_2_cta", "Shop Skincare")} />
            </SectionOverlay>
          </div>
        </div>
      </section>

      <SectionOverlay sectionId="featured" label="Featured Products" isActive={activeSection === "featured"} isHovered={hoveredSection === "featured"} onSelect={() => onSelect("featured")} onHover={(h) => onHover(h ? "featured" : null)}>
        <section className="bg-[#efe3d0] px-8 py-20">
          <div className="mx-auto max-w-[1800px]">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">{get("featured_eyebrow", "Featured Collection")}</p>
                <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">{get("featured_section_title", "Objects of desire.")}</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[var(--luxury-muted)]">{get("featured_section_subtitle", "A focused selection from the private labels now available in the store.")}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredProducts.length > 0
                ? featuredProducts.map((product) => {
                    const variant = product.variants?.[0];
                    return (
                      <div key={product.id} className="border border-[#d8c8ad] bg-[var(--luxury-paper)]">
                        <div className="relative aspect-[1/1.18] bg-[#ead9c0]">
                          {product.images[0]?.imageUrl && (
                            <Image src={product.images[0].imageUrl} alt={product.name} fill sizes="440px" className="object-cover" unoptimized />
                          )}
                        </div>
                        <div className="flex flex-col gap-3 p-5">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)]">
                            {product.brandName || "\u00A0"}
                          </p>
                          <h3 className="text-xl font-normal leading-snug [font-family:var(--font-serif)]">
                            {product.name}
                          </h3>
                          <p className="text-sm text-[var(--luxury-muted)]">
                            {variant
                              ? `${variant.variantName || ""}${variant.sellingPrice ? ` \u00B7 \u20B9${variant.sellingPrice.toLocaleString("en-IN")}` : ""}`
                              : "\u00A0"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                : Array.from({ length: 3 }).map((_, i) => (
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

      <SectionOverlay sectionId="best_sellers" label="Best Sellers" isActive={activeSection === "best_sellers"} isHovered={hoveredSection === "best_sellers"} onSelect={() => onSelect("best_sellers")} onHover={(h) => onHover(h ? "best_sellers" : null)}>
        <section className="px-8 py-20">
          <div className="mx-auto max-w-[1800px]">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
<p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">{get("best_sellers_eyebrow", "Most Loved")}</p>
<h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">{get("best_sellers_title", "The best sellers.")}</h2>
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">{get("best_sellers_link_text", "View all")}</span>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[1/1.08] animate-pulse rounded-[var(--luxury-radius)] bg-[#efe3d0]" />
              ))}
            </div>
          </div>
        </section>
      </SectionOverlay>

      <SectionOverlay sectionId="new_arrivals" label="New Arrivals" isActive={activeSection === "new_arrivals"} isHovered={hoveredSection === "new_arrivals"} onSelect={() => onSelect("new_arrivals")} onHover={(h) => onHover(h ? "new_arrivals" : null)}>
        <section className="bg-[#efe3d0] px-8 py-20">
          <div className="mx-auto max-w-[1800px]">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
<p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">{get("new_arrivals_eyebrow", "Just Arrived")}</p>
<h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">{get("new_arrivals_title", "New arrivals.")}</h2>
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-gold-strong)]">{get("new_arrivals_link_text", "Explore new")}</span>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[1/1.08] animate-pulse rounded-[var(--luxury-radius)] bg-[#ead9c0]" />
              ))}
            </div>
          </div>
        </section>
      </SectionOverlay>

      <SectionOverlay sectionId="brands" label="Brands Strip" isActive={activeSection === "brands"} isHovered={hoveredSection === "brands"} onSelect={() => onSelect("brands")} onHover={(h) => onHover(h ? "brands" : null)}>
        <section className="border-y border-[#d8c8ad] bg-[rgba(255,250,242,0.72)] px-8 py-12">
          <div className="mx-auto max-w-[1800px] text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-muted)]">{get("brands_eyebrow", "The Houses & Partners")}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {["Aurum House", "Maison Vela", "Saffron Atelier", "Cedar & Co."].map((brand) => (
                <span key={brand} className="text-base font-normal uppercase tracking-[0.16em] text-[var(--luxury-muted)] [font-family:var(--font-serif)]">{brand}</span>
              ))}
            </div>
          </div>
        </section>
      </SectionOverlay>


      <SectionOverlay sectionId="quote" label="Quote" isActive={activeSection === "quote"} isHovered={hoveredSection === "quote"} onSelect={() => onSelect("quote")} onHover={(h) => onHover(h ? "quote" : null)}>
        <section className="relative overflow-hidden bg-[var(--luxury-ink)] px-8 py-28 text-[var(--luxury-paper)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(182,138,66,0.14)_0%,rgba(22,18,13,0)_68%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <span aria-hidden className="block text-7xl leading-[0.6] text-[var(--luxury-gold)] [font-family:var(--font-serif)]">&ldquo;</span>
            <blockquote className="mt-4 text-4xl font-normal leading-relaxed [font-family:var(--font-serif)]">
              {get("quote_text", "A fragrance should be worn like a signature â€” quietly, deliberately, and entirely your own.")}
            </blockquote>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
              {get("quote_attribution", "The House Motto")}
            </p>
          </div>
        </section>
      </SectionOverlay>

      <SectionOverlay sectionId="banner" label="Maison Notes" isActive={activeSection === "banner"} isHovered={hoveredSection === "banner"} onSelect={() => onSelect("banner")} onHover={(h) => onHover(h ? "banner" : null)}>
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
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">{get("maison_notes_eyebrow", "Maison Notes")}</p>
              <h2 className="mt-3 text-6xl font-normal leading-tight [font-family:var(--font-serif)]">{get("product_banner_title", "A storefront for house labels that still feels tactile.")}</h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--luxury-muted)]">{get("product_banner_text", "The collection is staged like a real luxury catalogue.")}</p>
            </div>
          </div>
        </section>
      </SectionOverlay>

      <SectionOverlay sectionId="promises" label="House Promises" isActive={activeSection === "promises"} isHovered={hoveredSection === "promises"} onSelect={() => onSelect("promises")} onHover={(h) => onHover(h ? "promises" : null)}>
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

      <SectionOverlay sectionId="newsletter" label="Newsletter" isActive={activeSection === "newsletter"} isHovered={hoveredSection === "newsletter"} onSelect={() => onSelect("newsletter")} onHover={(h) => onHover(h ? "newsletter" : null)}>
        <section className="bg-[#efe3d0] px-8 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">{get("newsletter_eyebrow", "The List")}</p>
            <h2 className="mt-3 text-5xl font-normal [font-family:var(--font-serif)]">{get("newsletter_title", "Letters from the house.")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--luxury-muted)]">{get("newsletter_subtitle", "New releases, private previews, and quiet notes on the collection.")}</p>
            <div className="mx-auto mt-8 flex max-w-md gap-3">
              <div className="h-12 flex-1 rounded-full border border-[#d8c8ad] bg-[var(--luxury-input)]" />
              <div className="h-12 w-28 rounded-full bg-[var(--luxury-ink)]" />
            </div>
          </div>
        </section>
      </SectionOverlay>

      <SectionOverlay sectionId="cta" label="Bottom CTA" isActive={activeSection === "cta"} isHovered={hoveredSection === "cta"} onSelect={() => onSelect("cta")} onHover={(h) => onHover(h ? "cta" : null)}>
        <section className="px-8 py-28 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold-strong)]">{get("cta_eyebrow", "Begin Again")}</p>
            <h2 className="mt-3 text-6xl font-normal [font-family:var(--font-serif)]">{get("cta_title", "Find the next signature.")}</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--luxury-muted)]">{get("cta_subtitle", "Browse perfumes, attars, customised blends, face washes, creams, and nail care from the new house catalogue.")}</p>
            <span className="mt-8 inline-flex rounded-full bg-[var(--luxury-ink)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-paper)]">{get("cta_button_text", "Shop the Archive")}</span>
          </div>
        </section>
      </SectionOverlay>
    </div>
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

/* â”€â”€ Products Page Preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function ProductsPagePreview({
  get,
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
  return (
    <div className="bg-[var(--luxury-ivory)]">
      {/* Page banner - editable */}
      <SectionOverlay
        label="Page Banner"
        isActive={activeSection === "products_banner"}
        isHovered={hoveredSection === "products_banner"}
        sectionId="products_banner"
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
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.38em] text-[var(--luxury-gold)]">
                {get("products_eyebrow", "Curated Collection")}
              </p>
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
    </div>
  );
}

function ContactPreview({
  get,
  activeSection,
  hoveredSection,
  onSelect,
  onHover,
}: {
  get: (key: string, fallback?: string) => string;
  values: Record<string, string>;
  activeSection: ContactSectionId;
  hoveredSection: SectionId | null;
  onSelect: (id: SectionId) => void;
  onHover: (id: SectionId | null) => void;
}) {
  return (
    <div className="bg-[var(--luxury-ivory)]">
      <SectionOverlay
        label="Contact Info"
        isActive={activeSection === "contact_content"}
        isHovered={hoveredSection === "contact_content"}
        sectionId="contact_content"
        onSelect={() => onSelect("contact_content")}
        onHover={(h) => onHover(h ? "contact_content" : null)}
      >
        <section className="px-12 py-20">
          <div className="mx-auto grid max-w-6xl items-start gap-16 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="font-normal uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">
                {get("contact_eyebrow", "Contact")}
              </p>
              <h1 className="mt-5 text-5xl font-normal leading-[1.1] [font-family:var(--font-serif)] md:text-7xl">
                {get("contact_heading", "Contact us")}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--luxury-muted)]">
                {get("contact_description", "Reach out for help with orders, product selection, account questions, or delivery support.")}
              </p>
              <div className="mt-12 grid gap-5">
                <div className="flex gap-4 border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5">
                  <span className="mt-1 text-[var(--luxury-gold)]"><Mail size={20} /></span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxury-muted)]">Email</p>
                    <p className="mt-2 text-base [font-family:var(--font-serif)]">{get("contact_email", "care@fragrancehouse.test")}</p>
                  </div>
                </div>
                <div className="flex gap-4 border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5">
                  <span className="mt-1 text-[var(--luxury-gold)]"><Phone size={20} /></span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxury-muted)]">Phone</p>
                    <p className="mt-2 text-base [font-family:var(--font-serif)]">{get("contact_phone", "+91 98765 43210")}</p>
                  </div>
                </div>
                <div className="flex gap-4 border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5">
                  <span className="mt-1 text-[var(--luxury-gold)]"><MapPin size={20} /></span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxury-muted)]">Studio</p>
                    <p className="mt-2 text-base [font-family:var(--font-serif)]">{get("contact_address", "Bandra West, Mumbai, Maharashtra")}</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 border-t border-[#d8c8ad] pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">{get("contact_response_label", "Response Time")}</p>
                <p className="mt-3 text-base leading-7 text-[var(--luxury-muted)]">
                  {get("contact_response_text", "Most messages are reviewed within one business day. Include your order number if your message is about a purchase.")}
                </p>
              </div>
            </div>
            <div className="self-start border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_22px_70px_rgba(22,18,13,0.08)] md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                {[1, 2].map((i) => <div key={i} className="h-12 border border-[#d8c8ad] bg-[#fffaf2]" />)}
              </div>
              <div className="mt-5 h-12 border border-[#d8c8ad] bg-[#fffaf2]" />
              <div className="mt-5 h-32 border border-[#d8c8ad] bg-[#fffaf2]" />
              <div className="mt-6 h-12 w-full bg-[var(--luxury-ink)]" />
            </div>
          </div>
        </section>
      </SectionOverlay>
    </div>
  );
}

function InfoPagePreview({
  get,
  prefix,
  activeSection,
  hoveredSection,
  onSelect,
  onHover,
  sectionType,
}: {
  get: (key: string, fallback?: string) => string;
  prefix: string;
  activeSection: InfoPageSectionId;
  hoveredSection: SectionId | null;
  onSelect: (id: SectionId) => void;
  onHover: (id: SectionId | null) => void;
  sectionType: "question" | "title";
}) {
  let sections: { [k: string]: string }[] = [];
  try { sections = JSON.parse(get(`${prefix}_sections`, "[]")); } catch { /* */ }
  if (sections.length === 0) {
    sections = sectionType === "question"
      ? [{ question: "Sample question?", answer: "Sample answer text goes here." }]
      : [{ title: "Section Title", body: "Section body text goes here." }];
  }

  return (
    <div className="bg-[var(--luxury-ivory)]">
      <SectionOverlay
        label="Page Content"
        isActive={activeSection === "info_content"}
        isHovered={hoveredSection === "info_content"}
        sectionId="info_content"
        onSelect={() => onSelect("info_content")}
        onHover={(h) => onHover(h ? "info_content" : null)}
      >
        <section className="px-12 py-20">
          <div className="mx-auto max-w-5xl">
            <p className="font-normal uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">
              {get(`${prefix}_eyebrow`, "Help")}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-normal leading-[1.1] [font-family:var(--font-serif)] md:text-7xl">
              {get(`${prefix}_title`, "Page Title")}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--luxury-muted)] md:text-lg">
              {get(`${prefix}_intro`, "Page intro text goes here.")}
            </p>
            <div className="mt-14 border-t border-[#d8c8ad]">
              {sections.map((s, i) => (
                <section key={i} className="grid gap-6 py-12 md:grid-cols-[0.38fr_1fr] md:gap-10">
                  <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                    {sectionType === "question" ? s.question : s.title}
                  </h2>
                  <p className="text-base leading-7 text-[var(--luxury-muted)]">
                    {sectionType === "question" ? s.answer : s.body}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </section>
      </SectionOverlay>
    </div>
  );
}

function AuthPreview({
  get,
  prefix,
  activeSection,
  hoveredSection,
  onSelect,
  onHover,
}: {
  get: (key: string, fallback?: string) => string;
  prefix: string;
  activeSection: AuthSectionId;
  hoveredSection: SectionId | null;
  onSelect: (id: SectionId) => void;
  onHover: (id: SectionId | null) => void;
}) {
  return (
    <div className="bg-[var(--luxury-ivory)]">
      <SectionOverlay
        label="Brand Panel"
        isActive={activeSection === "auth_brand"}
        isHovered={hoveredSection === "auth_brand"}
        sectionId="auth_brand"
        onSelect={() => onSelect("auth_brand")}
        onHover={(h) => onHover(h ? "auth_brand" : null)}
      >
        <section className="flex min-h-[600px]">
          <div className="hidden w-[40%] bg-[var(--luxury-ink)] p-10 text-[var(--luxury-paper)] lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[var(--luxury-gold)]">
                {get(`${prefix}_eyebrow`, "Fragrance Commerce")}
              </p>
              <h1 className="mt-5 text-5xl font-normal leading-tight [font-family:var(--font-serif)]">
                {get(`${prefix}_brand_title`, prefix === "login" ? "Welcome back to your luxury fragrance account." : "Begin your fragrance ritual.")}
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/70">
              {get(`${prefix}_brand_description`, prefix === "login" ? "Sign in to revisit your wishlist, orders, and carefully selected fragrance rituals." : "Create an account to track orders, save favourites, and discover the private house collection.")}
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center bg-[var(--luxury-paper)] p-10">
            <div className="w-full max-w-md space-y-6">
              <div className="h-4 w-24 rounded bg-[#e5d9c4]" />
              <div className="h-8 w-40 rounded bg-[#e5d9c4]" />
              <div className="h-12 w-full rounded border border-[#d8c8ad] bg-[#fffaf2]" />
              <div className="h-12 w-full rounded border border-[#d8c8ad] bg-[#fffaf2]" />
              <div className="h-12 w-full rounded-full bg-[var(--luxury-ink)]" />
            </div>
          </div>
        </section>
      </SectionOverlay>
    </div>
  );
}

function NotFoundPreview({
  get,
  activeSection,
  hoveredSection,
  onSelect,
  onHover,
}: {
  get: (key: string, fallback?: string) => string;
  activeSection: NotFoundSectionId;
  hoveredSection: SectionId | null;
  onSelect: (id: SectionId) => void;
  onHover: (id: SectionId | null) => void;
}) {
  return (
    <div className="bg-[var(--luxury-ivory)]">
      <SectionOverlay
        label="404 Content"
        isActive={activeSection === "not_found_content"}
        isHovered={hoveredSection === "not_found_content"}
        sectionId="not_found_content"
        onSelect={() => onSelect("not_found_content")}
        onHover={(h) => onHover(h ? "not_found_content" : null)}
      >
        <section className="flex min-h-[600px] items-center justify-center px-12 py-20 text-center">
          <div className="max-w-2xl">
            <div className="mb-12 text-[200px] font-normal leading-none [font-family:var(--font-serif)] text-[var(--luxury-gold)]/20">
              404
            </div>
            <p className="font-normal uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">
              {get("not_found_eyebrow", "Page Not Found")}
            </p>
            <h1 className="mt-5 text-4xl font-normal leading-[1.1] [font-family:var(--font-serif)] sm:text-6xl md:text-7xl">
              {get("not_found_title", "The scent you've been searching for has evaporated.")}
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-[var(--luxury-muted-strong)] md:text-lg">
              {get("not_found_description", "Perhaps the fragrance house has moved to a new location, or the page has drifted into the mist. Our private collection awaits your return.")}
            </p>
            <div className="mt-12 flex justify-center gap-5">
              <div className="inline-flex rounded-full bg-[var(--luxury-ink)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-paper)]">
                Return Home
              </div>
              <div className="inline-flex rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-ink)]">
                Browse Collection
              </div>
            </div>
          </div>
        </section>
      </SectionOverlay>
    </div>
  );
}
