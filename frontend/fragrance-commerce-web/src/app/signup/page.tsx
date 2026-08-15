"use client";

import Link from "next/link";
import { useState, type SyntheticEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { register } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

interface FieldErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

const floatingLabel =
    "pointer-events-none absolute left-0 top-2 text-sm text-[var(--luxury-muted)] transition-all duration-200 " +
    "peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm " +
    "peer-focus:top-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-[var(--luxury-gold)] " +
    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] " +
    "peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.18em] " +
    "peer-[:not(:placeholder-shown)]:text-[var(--luxury-ink)]";

const inputClass = (hasError: boolean) =>
    `peer w-full border-b bg-transparent pt-6 pb-1.5 outline-none transition focus:border-[var(--luxury-gold)] ${
        hasError ? "border-red-400" : "border-[#c9b89c]"
    }`;

export default function SignupPage() {
    const { loginUser } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordChecks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        digit: /\d/.test(password),
    };

    function validate(): FieldErrors {
        const next: FieldErrors = {};

        if (!firstName.trim()) next.firstName = "First name is required.";
        else if (firstName.trim().length > 50)
            next.firstName = "First name must be at most 50 characters.";

        if (!lastName.trim()) next.lastName = "Last name is required.";
        else if (lastName.trim().length > 50)
            next.lastName = "Last name must be at most 50 characters.";

        if (!email.trim()) next.email = "Email is required.";
        else if (!EMAIL_REGEX.test(email.trim()))
            next.email = "A valid email address is required.";

        if (phoneNumber.trim() && phoneNumber.trim().length > 20)
            next.phoneNumber = "Phone number must be at most 20 characters.";

        if (!password) next.password = "Password is required.";
        else if (password.length < 8)
            next.password = "Password must be at least 8 characters long.";
        else if (!PASSWORD_REGEX.test(password))
            next.password =
                "Password must contain at least one uppercase letter, one lowercase letter, and one digit.";

        if (password && confirmPassword !== password)
            next.confirmPassword = "Passwords do not match.";

        return next;
    }

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        const nextErrors = validate();

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError("");
            setErrors({});

            const response = await register({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                password,
                phoneNumber: phoneNumber.trim() || undefined,
            });

            loginUser(response.email, response.roles, response.emailVerified);
        } catch (err) {
            if (
                typeof err === "object" &&
                err !== null &&
                typeof (err as { response?: { status?: number } }).response ===
                    "object" &&
                (err as { response?: { status?: number } }).response !== null
            ) {
                const status = (
                    err as { response: { status: number } }
                ).response.status;

                if (status === 429) {
                    setFormError(
                        "Too many attempts. Please wait a few minutes and try again."
                    );
                } else if (
                    status === 400 &&
                    typeof (err as { response: { data: unknown } }).response
                        .data === "string"
                ) {
                    setFormError(
                        (err as { response: { data: string } }).response.data
                    );
                } else {
                    setFormError(
                        "Something went wrong. Please try again later."
                    );
                }
            } else {
                setFormError("Unable to reach the server. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="relative flex min-h-[calc(100svh-65px)] items-start justify-center overflow-hidden bg-[var(--luxury-ivory)] p-4 pt-8 text-[var(--luxury-ink)] sm:p-6 sm:pt-10 lg:min-h-screen lg:items-center lg:pt-6">
            <h1 className="sr-only lg:hidden">Create Account</h1>

            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,#efe3d0,rgba(239,227,208,0))] sm:h-48" />

            <section className="relative grid w-full max-w-5xl overflow-hidden border border-[#d8c8ad] bg-[var(--luxury-paper)] shadow-[0_24px_70px_rgba(22,18,13,0.12)] lg:grid-cols-[0.9fr_1fr]">
                <div className="hidden bg-[var(--luxury-ink)] p-10 text-[var(--luxury-paper)] lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[var(--luxury-gold)]">
                            Fragrance Commerce
                        </p>

                        <h2 className="mt-5 text-5xl font-normal leading-tight [font-family:var(--font-serif)]">
                            Begin your fragrance ritual.
                        </h2>
                    </div>

                    <p className="max-w-sm text-sm leading-7 text-white/70">
                        Create an account to track orders, save favourites, and
                        discover the private house collection.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="w-full p-5 sm:p-8 md:p-10"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                        Account Registration
                    </p>

                    <h2 className="mt-3 text-3xl font-normal [font-family:var(--font-serif)] sm:text-4xl">
                        Create Account
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--luxury-muted)]">
                        Join Fragrance Commerce to start shopping.
                    </p>

                    {formError && (
                        <p
                            role="alert"
                            className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                            {formError}
                        </p>
                    )}

                    <div className="mt-7 grid gap-x-5 gap-y-6 sm:grid-cols-2">
                        <div>
                            <div className="relative">
                                <input
                                    id="signup-first-name"
                                    type="text"
                                    name="firstName"
                                    autoComplete="given-name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    aria-invalid={Boolean(errors.firstName)}
                                    className={inputClass(Boolean(errors.firstName))}
                                    placeholder=" "
                                    aria-label="First name"
                                />
                                <label
                                    htmlFor="signup-first-name"
                                    className={floatingLabel}
                                >
                                    First name
                                </label>
                            </div>
                            {errors.firstName && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.firstName}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <input
                                    id="signup-last-name"
                                    type="text"
                                    name="lastName"
                                    autoComplete="family-name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    aria-invalid={Boolean(errors.lastName)}
                                    className={inputClass(Boolean(errors.lastName))}
                                    placeholder=" "
                                    aria-label="Last name"
                                />
                                <label
                                    htmlFor="signup-last-name"
                                    className={floatingLabel}
                                >
                                    Last name
                                </label>
                            </div>
                            {errors.lastName && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.lastName}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <input
                                id="signup-email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-invalid={Boolean(errors.email)}
                                className={inputClass(Boolean(errors.email))}
                                placeholder=" "
                                aria-label="Email"
                            />
                            <label htmlFor="signup-email" className={floatingLabel}>
                                Email
                            </label>
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <input
                                id="signup-phone"
                                type="tel"
                                name="phone"
                                autoComplete="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                aria-invalid={Boolean(errors.phoneNumber)}
                                className={inputClass(Boolean(errors.phoneNumber))}
                                placeholder=" "
                                aria-label="Phone (optional)"
                            />
                            <label htmlFor="signup-phone" className={floatingLabel}>
                                Phone <span className="normal-case text-[var(--luxury-muted)]">(optional)</span>
                            </label>
                        </div>
                        {errors.phoneNumber && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.phoneNumber}
                            </p>
                        )}
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-invalid={Boolean(errors.password)}
                                className={`${inputClass(Boolean(errors.password))} pr-12`}
                                placeholder=" "
                                aria-label="Password"
                            />
                            <label
                                htmlFor="signup-password"
                                className={`${floatingLabel} peer-[:not(:placeholder-shown)]:max-w-[calc(100%-3rem)]`}
                            >
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[var(--luxury-muted)] transition hover:text-[var(--luxury-ink)]"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>

                        {errors.password ? (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.password}
                            </p>
                        ) : (
                            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--luxury-muted)]">
                                <li className={passwordChecks.length ? "text-[var(--luxury-moss)]" : ""}>
                                    {passwordChecks.length ? "✓" : "•"} 8+ characters
                                </li>
                                <li className={passwordChecks.upper ? "text-[var(--luxury-moss)]" : ""}>
                                    {passwordChecks.upper ? "✓" : "•"} Uppercase
                                </li>
                                <li className={passwordChecks.lower ? "text-[var(--luxury-moss)]" : ""}>
                                    {passwordChecks.lower ? "✓" : "•"} Lowercase
                                </li>
                                <li className={passwordChecks.digit ? "text-[var(--luxury-moss)]" : ""}>
                                    {passwordChecks.digit ? "✓" : "•"} Number
                                </li>
                            </ul>
                        )}
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <input
                                id="signup-confirm-password"
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                aria-invalid={Boolean(errors.confirmPassword)}
                                className={inputClass(Boolean(errors.confirmPassword))}
                                placeholder=" "
                                aria-label="Confirm password"
                            />
                            <label
                                htmlFor="signup-confirm-password"
                                className={floatingLabel}
                            >
                                Confirm password
                            </label>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <button
                        disabled={isSubmitting}
                        className="mt-8 w-full rounded-full bg-[var(--luxury-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:bg-[var(--luxury-muted-strong)] sm:tracking-[0.14em]"
                    >
                        {isSubmitting ? "Creating account..." : "Create Account"}
                    </button>

                    <p className="mt-5 text-center text-sm text-[var(--luxury-muted)]">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-[var(--luxury-ink)] underline-offset-4 transition hover:text-[var(--luxury-gold)] hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>
            </section>
        </main>
    );
}
