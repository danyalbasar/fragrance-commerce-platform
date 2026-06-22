"use client";

import { useState, type SyntheticEvent } from "react";
import { login } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const { loginUser } = useAuth();

    const [email, setEmail] = useState("customer@test.com");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setIsLoggingIn(true);
            setError("");

            const response = await login({
                email,
                password,
            });

            loginUser(response.token, response.email);
        } catch {
            setError("Invalid email or password.");
        } finally {
            setIsLoggingIn(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"
            >
                <h1 className="text-3xl font-bold">Login</h1>

                <p className="mt-2 text-sm text-gray-500">
                    Sign in to continue shopping.
                </p>

                {error && (
                    <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="mt-6">
                    <label className="text-sm font-medium">Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        placeholder="customer@test.com"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        placeholder="Enter password"
                    />
                </div>

                <button
                    disabled={isLoggingIn}
                    className="mt-6 w-full rounded-full bg-black py-3 font-semibold text-white hover:bg-neutral-800 disabled:bg-gray-400"
                >
                    {isLoggingIn ? "Logging in..." : "Login"}
                </button>
            </form>
        </main>
    );
}