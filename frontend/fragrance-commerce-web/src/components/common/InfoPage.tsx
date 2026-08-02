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
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
                    {eyebrow}
                </p>

                <h1 className="mt-4 max-w-4xl text-5xl font-normal leading-tight [font-family:var(--font-serif)] md:text-7xl">
                    {title}
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--luxury-muted)] md:text-lg">
                    {intro}
                </p>

                <div className="mt-12 border-t border-[#d8c8ad]">
                    {sections.map((section) => (
                        <section
                            key={section.title}
                            className="grid gap-4 border-b border-[#d8c8ad] py-8 md:grid-cols-[0.38fr_1fr]"
                        >
                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                {section.title}
                            </h2>

                            <p className="text-sm leading-7 text-[var(--luxury-muted)]">
                                {section.body}
                            </p>
                        </section>
                    ))}
                </div>

                {contactCta && (
                    <div className="mt-10 bg-[var(--luxury-ink)] p-8 text-[var(--luxury-paper)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--luxury-gold)]">
                            Need Help?
                        </p>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                            For order support, product questions, or return help, send us a note and we will guide you through the next step.
                        </p>
                        <Link
                            href="/contact"
                            className="mt-6 inline-flex bg-[var(--luxury-gold)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--luxury-ink)] transition hover:bg-[#d1ab67]"
                        >
                            Contact Us
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
