"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    email: string | null;
    initials: string | null;
    token: string | null;
    roles: string[];
    authReady: boolean;
    isLoggedIn: boolean;
    loginUser: (token: string, email: string, roles?: string[]) => void;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [authReady, setAuthReady] = useState(false);

    const initials = email
        ? email.substring(0, 1).toUpperCase()
        : null;

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedEmail = localStorage.getItem("email");
        const savedRoles = localStorage.getItem("roles");

        setToken(savedToken);
        setEmail(savedEmail);
        try {
            setRoles(savedRoles ? JSON.parse(savedRoles) : []);
        } catch {
            setRoles([]);
        }

        setAuthReady(true);
    }, []);

    function loginUser(newToken: string, userEmail: string, userRoles: string[] = []) {
        localStorage.setItem("token", newToken);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("roles", JSON.stringify(userRoles));

        setToken(newToken);
        setEmail(userEmail);
        setRoles(userRoles);

        router.replace(userRoles.includes("Vendor") ? "/vendor" : "/");
    }

    function logoutUser() {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("roles");

        setToken(null);
        setEmail(null);
        setRoles([]);

        router.replace("/login");
    }

    return (
        <AuthContext.Provider
            value={{
                email,
                initials,
                token,
                roles,
                authReady,
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
