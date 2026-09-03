"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { createContactMessage } from "@/services/contactService";
import { getPublicSettings } from "@/services/siteSettingsService";
import { ContactPageSkeleton } from "@/components/common/ContactPageSkeleton";

const initialForm = {
    fullName: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: "",
};

export default function ContactPage() {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [cms, setCms] = useState<Record<string, string>>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getPublicSettings()
            .then(setCms)
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, []);

    if (!loaded) {
        return <ContactPageSkeleton />;
    }

    function updateField(
        field: keyof typeof initialForm,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (status !== "idle") {
            setStatus("idle");
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setSubmitting(true);
            setStatus("idle");

            await createContactMessage({
                fullName: form.fullName,
                email: form.email,
                phoneNumber: form.phoneNumber || undefined,
                subject: form.subject,
                message: form.message,
            });

            setForm(initialForm);
            setStatus("success");
        } catch {
            setStatus("error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-[var(--luxury-ivory)] px-6 py-14 text-[var(--luxury-ink)] md:px-10 md:py-20">
            <section className="mx-auto grid max-w-6xl items-start gap-16 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                    <p className="font-normal uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">
                        {cms.contact_eyebrow || "Contact"}
                    </p>

                    <h1 className="mt-5 text-5xl font-normal leading-[1.1] [font-family:var(--font-serif)] md:text-7xl">
                        {cms.contact_heading || "Contact us"}
                    </h1>

                    <p className="mt-6 max-w-xl text-base leading-8 text-[var(--luxury-muted)]">
                        {cms.contact_description || "Reach out for help with orders, product selection, account questions, or delivery support."}
                    </p>

                    <div className="mt-12 grid gap-5">
                        <ContactDetail
                            icon={<Mail size={20} />}
                            label="Email"
                            value={cms.contact_email || "care@fragrancehouse.test"}
                        />
                        <ContactDetail
                            icon={<Phone size={20} />}
                            label="Phone"
                            value={cms.contact_phone || "+91 98765 43210"}
                        />
                        <ContactDetail
                            icon={<MapPin size={20} />}
                            label="Studio"
                            value={cms.contact_address || "Bandra West, Mumbai, Maharashtra"}
                        />
                    </div>

                    <div className="mt-12 border-t border-[#d8c8ad] pt-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">
                            {cms.contact_response_label || "Response Time"}
                        </p>
                        <p className="mt-3 text-base leading-7 text-[var(--luxury-muted)]">
                            {cms.contact_response_text || "Most messages are reviewed within one business day. Include your order number if your message is about a purchase."}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    aria-busy={submitting}
                    className="self-start border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_22px_70px_rgba(22,18,13,0.08)] md:p-8"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Full Name" htmlFor="fullName">
                            <input
                                id="fullName"
                                required
                                maxLength={150}
                                autoComplete="name"
                                value={form.fullName}
                                onChange={(event) =>
                                    updateField("fullName", event.target.value)
                                }
                                className="h-12 w-full border border-[#d8c8ad] bg-[#fffaf2] px-4 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                        </Field>

                        <Field label="Email" htmlFor="email">
                            <input
                                id="email"
                                type="email"
                                required
                                maxLength={255}
                                autoComplete="email"
                                value={form.email}
                                onChange={(event) =>
                                    updateField("email", event.target.value)
                                }
                                className="h-12 w-full border border-[#d8c8ad] bg-[#fffaf2] px-4 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                        </Field>

                        <Field label="Phone" htmlFor="phoneNumber">
                            <input
                                id="phoneNumber"
                                type="tel"
                                maxLength={30}
                                autoComplete="tel"
                                value={form.phoneNumber}
                                onChange={(event) =>
                                    updateField("phoneNumber", event.target.value)
                                }
                                className="h-12 w-full border border-[#d8c8ad] bg-[#fffaf2] px-4 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                        </Field>

                        <Field label="Subject" htmlFor="subject">
                            <input
                                id="subject"
                                required
                                maxLength={180}
                                value={form.subject}
                                onChange={(event) =>
                                    updateField("subject", event.target.value)
                                }
                                className="h-12 w-full border border-[#d8c8ad] bg-[#fffaf2] px-4 text-sm outline-none transition focus:border-[var(--luxury-gold)]"
                            />
                        </Field>
                    </div>

                    <Field label="Message" htmlFor="message" className="mt-5">
                        <textarea
                            id="message"
                            required
                            maxLength={2000}
                            rows={7}
                            value={form.message}
                            onChange={(event) =>
                                updateField("message", event.target.value)
                            }
                            className="w-full resize-none border border-[#d8c8ad] bg-[#fffaf2] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[var(--luxury-gold)]"
                        />
                    </Field>

                    {status === "success" && (
                        <p role="status" className="mt-5 border border-[#d7ad62] bg-[#fff6e4] px-4 py-3 text-sm text-[#8a5a12]">
                            Your message has been sent. We will get back to you soon.
                        </p>
                    )}

                    {status === "error" && (
                        <p role="alert" className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            We could not send your message. Please try again.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-6 h-12 w-full bg-[var(--luxury-ink)] text-sm font-semibold uppercase tracking-[0.18em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:cursor-not-allowed disabled:bg-[var(--luxury-muted-strong)]"
                    >
                        {submitting ? "Sending..." : "Submit"}
                    </button>
                </form>
            </section>
        </main>
    );
}

function ContactDetail({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-4 border border-[#d8c8ad] bg-[var(--luxury-paper)] p-5">
            <span className="mt-1 text-[var(--luxury-gold)]">{icon}</span>
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                    {label}
                </p>
                <p className="mt-2 text-base [font-family:var(--font-serif)]">
                    {value}
                </p>
            </div>
        </div>
    );
}

function Field({
    label,
    htmlFor,
    className = "",
    children,
}: {
    label: string;
    htmlFor: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <label className={`block ${className}`} htmlFor={htmlFor}>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-muted)]">
                {label}
            </span>
            {children}
        </label>
    );
}
