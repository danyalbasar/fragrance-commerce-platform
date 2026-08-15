"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, Loader2 } from "lucide-react";
import { resendVerification, verifyEmail } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-[calc(100svh-65px)] items-center justify-center bg-[var(--luxury-ivory)]">
                    <Loader2 className="animate-spin text-[var(--luxury-gold)]" />
                </main>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { email, loginUser, setEmailVerified, isLoggedIn } = useAuth();

    const token = searchParams.get("token");

    const [status, setStatus] = useState<"verifying" | "success" | "error">(
        token ? "verifying" : "success"
    );
    const [message, setMessage] = useState("");
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!token) return;

        let cancelled = false;

        verifyEmail({ token })
            .then((response) => {
                if (cancelled) return;

                setStatus("success");
                setEmailVerified(true);

                if (!isLoggedIn) {
                    loginUser(response.email, response.roles, true);
                }
            })
            .catch((err) => {
                if (cancelled) return;

                setStatus("error");
                setMessage(
                    (err as { response?: { data?: string } })?.response?.data ||
                        "This verification link is invalid or expired."
                );
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function handleResend() {
        if (!email) return;

        setResending(true);
        setMessage("");

        try {
            await resendVerification({ email });
            setMessage(
                "A new verification link has been sent. Please check your inbox."
            );
        } catch {
            setMessage(
                "We could not resend the email. Please try again later."
            );
        } finally {
            setResending(false);
        }
    }

    return (
        <main className="relative flex min-h-[calc(100svh-65px)] items-start justify-center overflow-hidden bg-[var(--luxury-ivory)] p-4 pt-8 text-[var(--luxury-ink)] sm:p-6 sm:pt-10 lg:min-h-screen lg:items-center lg:pt-6">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,#efe3d0,rgba(239,227,208,0))] sm:h-48" />

            <section className="relative w-full max-w-md border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 text-center shadow-[0_24px_70px_rgba(22,18,13,0.12)] sm:p-10">
                {status === "verifying" && (
                    <>
                        <Loader2
                            size={40}
                            className="mx-auto animate-spin text-[var(--luxury-gold)]"
                        />
                        <h1 className="mt-5 text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                            Verifying your email
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-[var(--luxury-muted)]">
                            Just a moment while we confirm your account.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <MailCheck
                            size={40}
                            className="mx-auto text-[var(--luxury-gold)]"
                        />
                        <h1 className="mt-5 text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                            {token ? "Email verified" : "Check your inbox"}
                        </h1>

                        {token ? (
                            <p className="mt-2 text-sm leading-6 text-[var(--luxury-muted)]">
                                Your email has been verified. You can now shop
                                the collection.
                            </p>
                        ) : (
                            <p className="mt-2 text-sm leading-6 text-[var(--luxury-muted)]">
                                We have sent a verification link to{" "}
                                <span className="font-semibold text-[var(--luxury-ink)]">
                                    {email ?? "your inbox"}
                                </span>
                                . Click the link in the email to activate your
                                account.
                            </p>
                        )}

                        {token ? (
                            <button
                                onClick={() => router.push("/")}
                                className="mt-6 w-full rounded-full bg-[var(--luxury-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] sm:tracking-[0.14em]"
                            >
                                Continue shopping
                            </button>
                        ) : (
                            <>
                                {message && (
                                    <p className="mt-4 border border-[#d8c8ad] bg-[#fffaf2] p-3 text-sm text-[var(--luxury-ink)]">
                                        {message}
                                    </p>
                                )}

                                <button
                                    disabled={resending}
                                    onClick={handleResend}
                                    className="mt-6 w-full rounded-full bg-[var(--luxury-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:bg-[var(--luxury-muted-strong)] sm:tracking-[0.14em]"
                                >
                                    {resending
                                        ? "Sending..."
                                        : "Resend verification link"}
                                </button>

                                <Link
                                    href="/login"
                                    className="mt-5 inline-block text-sm font-semibold text-[var(--luxury-ink)] underline-offset-4 transition hover:text-[var(--luxury-gold)] hover:underline"
                                >
                                    Go to login
                                </Link>
                            </>
                        )}
                    </>
                )}

                {status === "error" && (
                    <>
                        <h1 className="mt-5 text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                            Unable to verify email
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-[var(--luxury-muted)]">
                            {message}
                        </p>

                        <Link
                            href="/verify-email"
                            className="mt-5 inline-block text-sm font-semibold text-[var(--luxury-ink)] underline-offset-4 transition hover:text-[var(--luxury-gold)] hover:underline"
                        >
                            Request a new link
                        </Link>
                    </>
                )}
            </section>
        </main>
    );
}
