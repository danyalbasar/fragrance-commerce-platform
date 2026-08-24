"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { MailCheck, Loader2 } from "lucide-react";
import { forgotPassword } from "@/services/authService";

const floatingLabel =
    "pointer-events-none absolute left-0 top-2 text-sm text-[var(--luxury-muted)] transition-all duration-200 " +
    "peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm " +
    "peer-focus:top-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-[var(--luxury-gold)] " +
    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] " +
    "peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.18em] " +
    "peer-[:not(:placeholder-shown)]:text-[var(--luxury-ink)]";

const underlineInput =
    "peer w-full border-b border-[#c9b89c] bg-transparent pt-6 pb-1.5 outline-none transition focus:border-[var(--luxury-gold)]";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await forgotPassword({ email });
            setSent(true);
        } catch {
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-[calc(100svh-65px)] items-start justify-center overflow-hidden bg-[var(--luxury-ivory)] p-4 pt-8 text-[var(--luxury-ink)] sm:p-6 sm:pt-10 lg:min-h-screen lg:items-center lg:pt-6">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,#efe3d0,rgba(239,227,208,0))] sm:h-48" />

            <section className="relative w-full max-w-md border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_24px_70px_rgba(22,18,13,0.12)] sm:p-10">
                {sent ? (
                    <>
                        <MailCheck
                            size={40}
                            className="mx-auto text-[var(--luxury-gold)]"
                        />
                        <h1 className="mt-5 text-center text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                            Check your inbox
                        </h1>
                        <p className="mt-2 text-center text-sm leading-6 text-[var(--luxury-muted)]">
                            If an account exists for{" "}
                            <span className="font-semibold text-[var(--luxury-ink)]">
                                {email}
                            </span>
                            , we have sent a password reset link.
                        </p>
                        <p className="mt-2 text-center text-xs text-[var(--luxury-muted)]">
                            Didn&apos;t receive it? Check your spam folder, or try again.
                        </p>

                        <button
                            onClick={() => {
                                setSent(false);
                                setEmail("");
                            }}
                            className="mt-6 w-full rounded-full border border-[#d8c8ad] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-ink)] transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] sm:tracking-[0.14em]"
                        >
                            Send another link
                        </button>

                        <Link
                            href="/login"
                            className="mt-5 block text-center text-sm font-semibold text-[var(--luxury-ink)] underline-offset-4 transition hover:text-[var(--luxury-gold)] hover:underline"
                        >
                            Back to login
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                            Password Recovery
                        </p>

                        <h1 className="mt-3 text-center text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl">
                            Forgot password?
                        </h1>

                        <p className="mt-2 text-center text-sm leading-6 text-[var(--luxury-muted)]">
                            Enter your email and we will send you a reset link.
                        </p>

                        {error && (
                            <p role="alert" className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="mt-7">
                            <div className="relative">
                                <input
                                    id="forgot-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={underlineInput}
                                    placeholder=" "
                                    aria-label="Email"
                                    required
                                />
                                <label htmlFor="forgot-email" className={floatingLabel}>
                                    Email
                                </label>
                            </div>

                            <button
                                disabled={loading}
                                className="mt-8 w-full rounded-full bg-[var(--luxury-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:bg-[var(--luxury-muted-strong)] sm:tracking-[0.14em]"
                            >
                                {loading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Sending...
                                    </span>
                                ) : (
                                    "Send reset link"
                                )}
                            </button>
                        </form>

                        <Link
                            href="/login"
                            className="mt-5 block text-center text-sm font-semibold text-[var(--luxury-ink)] underline-offset-4 transition hover:text-[var(--luxury-gold)] hover:underline"
                        >
                            Back to login
                        </Link>
                    </>
                )}
            </section>
        </main>
    );
}
