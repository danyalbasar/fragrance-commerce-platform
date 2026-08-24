"use client";

import { Suspense, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/services/authService";

const floatingLabel =
    "pointer-events-none absolute left-0 top-2 text-sm text-[var(--luxury-muted)] transition-all duration-200 " +
    "peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm " +
    "peer-focus:top-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-[var(--luxury-gold)] " +
    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] " +
    "peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.18em] " +
    "peer-[:not(:placeholder-shown)]:text-[var(--luxury-ink)]";

const underlineInput =
    "peer w-full border-b border-[#c9b89c] bg-transparent pt-6 pb-1.5 pr-10 outline-none transition focus:border-[var(--luxury-gold)]";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-[calc(100svh-65px)] items-center justify-center bg-[var(--luxury-ivory)]">
                    <Loader2 className="animate-spin text-[var(--luxury-gold)]" />
                </main>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState<"form" | "success">("form");
    const [loading, setLoading] = useState(false);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    const isValid =
        password.length >= 8 &&
        passwordRegex.test(password) &&
        password === confirmPassword;

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!token) return;
        setError("");
        setLoading(true);

        try {
            await resetPassword({ token, newPassword: password });
            setStatus("success");
        } catch (err) {
            setError(
                (err as { response?: { data?: string } })?.response?.data ||
                    "This reset link is invalid or has expired."
            );
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <main className="relative flex min-h-[calc(100svh-65px)] items-start justify-center overflow-hidden bg-[var(--luxury-ivory)] p-4 pt-8 text-[var(--luxury-ink)] sm:p-6 sm:pt-10 lg:min-h-screen lg:items-center lg:pt-6">
                <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,#efe3d0,rgba(239,227,208,0))] sm:h-48" />
                <section className="relative w-full max-w-md border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 text-center shadow-[0_24px_70px_rgba(22,18,13,0.12)] sm:p-10">
                    <h1 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                        Invalid link
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-[var(--luxury-muted)]">
                        This password reset link is not valid. Please request a new one.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="mt-6 inline-block w-full rounded-full bg-[var(--luxury-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] sm:tracking-[0.14em]"
                    >
                        Request a new link
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="relative flex min-h-[calc(100svh-65px)] items-start justify-center overflow-hidden bg-[var(--luxury-ivory)] p-4 pt-8 text-[var(--luxury-ink)] sm:p-6 sm:pt-10 lg:min-h-screen lg:items-center lg:pt-6">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,#efe3d0,rgba(239,227,208,0))] sm:h-48" />

            <section className="relative w-full max-w-md border border-[#d8c8ad] bg-[var(--luxury-paper)] p-6 shadow-[0_24px_70px_rgba(22,18,13,0.12)] sm:p-10">
                {status === "success" ? (
                    <>
                        <CheckCircle
                            size={40}
                            className="mx-auto text-[var(--luxury-gold)]"
                        />
                        <h1 className="mt-5 text-center text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                            Password reset
                        </h1>
                        <p className="mt-2 text-center text-sm leading-6 text-[var(--luxury-muted)]">
                            Your password has been updated. You can now sign in with your new password.
                        </p>

                        <button
                            onClick={() => router.push("/login")}
                            className="mt-6 w-full rounded-full bg-[var(--luxury-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] sm:tracking-[0.14em]"
                        >
                            Go to login
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                            New Password
                        </p>

                        <h1 className="mt-3 text-center text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl">
                            Reset your password
                        </h1>

                        <p className="mt-2 text-center text-sm leading-6 text-[var(--luxury-muted)]">
                            Enter a new password for your account.
                        </p>

                        {error && (
                            <p role="alert" className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
                            <div>
                                <div className="relative">
                                    <input
                                        id="reset-password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={underlineInput}
                                        placeholder=" "
                                        aria-label="New password"
                                        required
                                    />
                                    <label htmlFor="reset-password" className={floatingLabel}>
                                        New password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[var(--luxury-muted)] transition hover:text-[var(--luxury-ink)]"
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {password.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        <PasswordCheck
                                            met={password.length >= 8}
                                            label="At least 8 characters"
                                        />
                                        <PasswordCheck
                                            met={/[A-Z]/.test(password)}
                                            label="One uppercase letter"
                                        />
                                        <PasswordCheck
                                            met={/[a-z]/.test(password)}
                                            label="One lowercase letter"
                                        />
                                        <PasswordCheck
                                            met={/\d/.test(password)}
                                            label="One digit"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    id="reset-confirm"
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={underlineInput}
                                    placeholder=" "
                                    aria-label="Confirm password"
                                    required
                                />
                                <label htmlFor="reset-confirm" className={floatingLabel}>
                                    Confirm password
                                </label>
                                {confirmPassword.length > 0 && confirmPassword !== password && (
                                    <p className="mt-2 text-xs text-red-600">
                                        Passwords do not match.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!isValid || loading}
                                className="w-full rounded-full bg-[var(--luxury-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:bg-[var(--luxury-muted-strong)] sm:tracking-[0.14em]"
                            >
                                {loading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Resetting...
                                    </span>
                                ) : (
                                    "Reset password"
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

function PasswordCheck({ met, label }: { met: boolean; label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs">
            <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                    met ? "bg-green-500" : "bg-[var(--luxury-muted)]/40"
                }`}
            />
            <span className={met ? "text-green-700" : "text-[var(--luxury-muted)]"}>
                {label}
            </span>
        </div>
    );
}
