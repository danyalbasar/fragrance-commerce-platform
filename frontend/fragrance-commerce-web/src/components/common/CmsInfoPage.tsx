"use client";

import { useEffect, useState } from "react";
import InfoPage from "./InfoPage";
import { getPublicSettings } from "@/services/siteSettingsService";

interface CmsInfoPageProps {
  prefix: string;
  contactCta?: boolean;
  sectionType?: "question" | "title";
}

export default function CmsInfoPage({ prefix, contactCta = true, sectionType = "title" }: CmsInfoPageProps) {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  const get = (key: string, fallback = "") => settings[key] || fallback;

  let rawSections: { [k: string]: string }[] = [];
  try { rawSections = JSON.parse(get(`${prefix}_sections`, "[]")); } catch { /* */ }

  const sections = rawSections.map((s) => ({
    title: sectionType === "question" ? (s.question || "") : (s.title || ""),
    body: sectionType === "question" ? (s.answer || "") : (s.body || ""),
  }));

  return (
    <InfoPage
      eyebrow={get(`${prefix}_eyebrow`, "Help")}
      title={get(`${prefix}_title`, "Page Title")}
      intro={get(`${prefix}_intro`, "")}
      sections={sections}
      contactCta={contactCta}
    />
  );
}
