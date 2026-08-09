import Link from "next/link";

interface InfoSection {
    title: string;
    body: string;
}

interface InfoPageProps {
    eyebrow: string;
    title: string;
    intro: string;
    sections: InfoSection[];
    contactCta?: boolean;
}

export default function InfoPage({
    eyebrow,
    title,
    intro,
    sections,
    contactCta = false,
}: InfoPageProps) {
    return (
        <main className="min-h-screen bg-[var(--luxury-ivory)] px-6 py-14 text-[var(--luxury-ink)] md:px-10 md:py-20">
            <section className="mx-auto max-w-5xl">
                <p className="font-normal uppercase tracking-[0.24em] text-[var(--luxury-gold-strong)]">
                    {eyebrow}
                </p>

                <h1 className="mt-5 max-w-4xl text-5xl font-normal leading-[1.1] [font-family:var(--font-serif)] md:text-7xl">
                    {title}
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--luxury-muted)] md:text-lg">
                    {intro}
                </p>

                <div className="mt-14 border-t border-[#d8c8ad]">
                    {sections.map((section) => (
                        <section
                            key={section.title}
                            className="grid gap-6 py-12 md:grid-cols-[0.38fr_1fr] md:gap-10"
                        >
                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                {section.title}
                            </h2>

                            <p className="text-base leading-7 text-[var(--luxury-muted)]">
                                {section.body}
                            </p>
                        </section>
                    ))}
                </div>

                {contactCta && (
                    <div className="mt-14 bg-[var(--luxury-ink)] p-10 text-[var(--luxury-paper)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxury-gold)]">
                            Need Help?
                        </p>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
                            For order support, product questions, or return help, send us a note and we will guide you through the next step.
                        </p>
                        <Link
                            href="/contact"
                            className="mt-8 inline-flex bg-[var(--luxury-gold)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-ink)] transition-all duration-300 hover:bg-[#d1ab67] hover:scale-[1.02] shadow-[0_12px_30px_rgba(22,18,13,0.12)]"
                        >
                            Contact Us
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
