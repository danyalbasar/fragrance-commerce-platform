"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    email: string | null;
    initials: string | null;
    token: string | null;
    isLoggedIn: boolean;
    loginUser: (token: string, email: string) => void;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const initials = email
        ? email.substring(0, 2).toUpperCase()
        : null;

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedEmail = localStorage.getItem("email");

        setToken(savedToken);
        setEmail(savedEmail);
    }, []);

    function loginUser(newToken: string, userEmail: string) {
        localStorage.setItem("token", newToken);
        localStorage.setItem("email", userEmail);

        setToken(newToken);
        setEmail(userEmail);

        router.replace("/");
    }

    function logoutUser() {
        localStorage.removeItem("token");
        localStorage.removeItem("email");

        setToken(null);
        setEmail(null);

        router.replace("/login");
    }

    return (
        <AuthContext.Provider
            value={{
                email,
                initials,
                token,
                isLoggedIn: !!token,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}