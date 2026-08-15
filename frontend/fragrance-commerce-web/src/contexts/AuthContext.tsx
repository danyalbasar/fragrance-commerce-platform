"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, logout as logoutRequest } from "@/services/authService";
import { clearUserCache } from "@/utils/swrCache";

interface AuthContextType {
    email: string | null;
    initials: string | null;
    roles: string[];
    authReady: boolean;
    isLoggedIn: boolean;
    loginUser: (email: string, roles?: string[]) => void;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authReady, setAuthReady] = useState(false);

    const initials = email
        ? email.substring(0, 1).toUpperCase()
        : null;

    useEffect(() => {
        let cancelled = false;

        me()
            .then((data) => {
                if (cancelled) return;

                setEmail(data.email);
                setRoles(data.roles);
                setIsLoggedIn(true);
                localStorage.setItem("email", data.email);
            })
            .catch(() => {
                if (cancelled) return;
            })
            .finally(() => {
                if (!cancelled) setAuthReady(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    function loginUser(userEmail: string, userRoles: string[] = []) {
        localStorage.setItem("email", userEmail);

        setEmail(userEmail);
        setRoles(userRoles);
        setIsLoggedIn(true);

        router.replace(userRoles.includes("Vendor") ? "/vendor" : "/");
    }

    function logoutUser() {
        logoutRequest().catch(() => {});

        localStorage.removeItem("email");
        clearUserCache();

        setEmail(null);
        setRoles([]);
        setIsLoggedIn(false);

        router.replace("/login");
    }

    return (
        <AuthContext.Provider
            value={{
                email,
                initials,
                roles,
                authReady,
                isLoggedIn,
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
