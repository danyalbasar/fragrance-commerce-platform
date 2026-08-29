"use client";

import Link from "next/link";
import { useEffect, useState, type SyntheticEvent } from "react";
import { login } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { getApiResponse } from "@/services/api";
import { getPublicSettings } from "@/services/siteSettingsService";

const floatingLabel =
    "pointer-events-none absolute left-0 top-2 text-sm text-[var(--luxury-muted)] transition-all duration-200 " +
    "peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm " +
    "peer-focus:top-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-[var(--luxury-gold)] " +
    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] " +
    "peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.18em] " +
    "peer-[:not(:placeholder-shown)]:text-[var(--luxury-ink)]";

const underlineInput =
    "peer w-full border-b border-[#c9b89c] bg-transparent pt-6 pb-1.5 outline-none transition focus:border-[var(--luxury-gold)]";

export default function LoginPage() {
    const { loginUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [cms, setCms] = useState<Record<string, string>>({});

    useEffect(() => {
        getPublicSettings().then(setCms).catch(() => {});
    }, []);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setIsLoggingIn(true);
            setError("");
            setIsEmailNotVerified(false);

            const response = await login({
                email,
                password,
            });

            loginUser(response.email, response.roles, response.emailVerified);
        } catch (err) {
            const apiResponse = getApiResponse(err);

            if (apiResponse?.status === 403) {
                setError("Please verify your email address before signing in.");
                setIsEmailNotVerified(true);
            } else {
                setError("Invalid email or password.");
            }
        } finally {
            setIsLoggingIn(false);
        }
    }

    return (
        <main className="relative flex min-h-[calc(100svh-65px)] items-start justify-center overflow-hidden bg-[var(--luxury-ivory)] p-4 pt-8 text-[var(--luxury-ink)] sm:p-6 sm:pt-10 lg:min-h-screen lg:items-center lg:pt-6">
            <h1 className="sr-only lg:hidden">Login</h1>

            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,#efe3d0,rgba(239,227,208,0))] sm:h-48" />

            <section className="relative grid w-full max-w-5xl overflow-hidden border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_24px_70px_rgba(22,18,13,0.12)] lg:grid-cols-[0.9fr_1fr] lg:-translate-y-6">
                <div className="hidden bg-[var(--luxury-ink)] p-10 text-[var(--luxury-paper)] lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[var(--luxury-gold)]">
                            {cms.login_eyebrow || "Fragrance Commerce"}
                        </p>

                        <h1 className="mt-5 text-5xl font-normal leading-tight [font-family:var(--font-serif)]">
                            {cms.login_brand_title || "Welcome back to your luxury fragrance account."}
                        </h1>
                    </div>

                    <p className="max-w-sm text-sm leading-7 text-white/70">
                        {cms.login_brand_description || "Sign in to revisit your wishlist, orders, and carefully selected fragrance rituals."}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="w-full p-5 sm:p-8 md:p-10"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                        {cms.login_form_eyebrow || "Account Sign In"}
                    </p>

                    <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl">
                        Login
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--luxury-muted)]">
                        Sign in to continue shopping.
                    </p>

                    {error && (
                        <p role="alert" className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}{" "}
                            {isEmailNotVerified && (
                                <Link
                                    href="/verify-email"
                                    className="font-semibold underline underline-offset-2"
                                >
                                    Resend verification link
                                </Link>
                            )}
                        </p>
                    )}

                    <div className="mt-7">
                        <div className="relative">
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={underlineInput}
                                placeholder=" "
                                aria-label="Email"
                            />
                            <label htmlFor="login-email" className={floatingLabel}>
                                Email
                            </label>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <input
                                id="login-password"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={underlineInput}
                                placeholder=" "
                                aria-label="Password"
                            />
                            <label htmlFor="login-password" className={floatingLabel}>
                                Password
                            </label>
                        </div>
                        <div className="mt-2 text-right">
                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-[var(--luxury-muted)] transition hover:text-[var(--luxury-gold)]"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        disabled={isLoggingIn}
                        className="mt-8 w-full rounded-full bg-[var(--luxury-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:bg-[var(--luxury-muted-strong)] sm:tracking-[0.14em]"
                    >
                        {isLoggingIn ? "Logging in..." : "Login"}
                    </button>

                    <p className="mt-5 text-center text-sm text-[var(--luxury-muted)]">
                        New here?{" "}
                        <Link
                            href="/signup"
                            className="font-semibold text-[var(--luxury-ink)] underline-offset-4 transition hover:text-[var(--luxury-gold)] hover:underline"
                        >
                            Create an account
                        </Link>
                    </p>
                </form>
            </section>
        </main>
    );
}
