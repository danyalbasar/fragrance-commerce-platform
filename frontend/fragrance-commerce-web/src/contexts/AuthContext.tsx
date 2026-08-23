"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, logout as logoutRequest } from "@/services/authService";
import { clearUserCache } from "@/utils/swrCache";

interface AuthContextType {
    email: string | null;
    initials: string | null;
    roles: string[];
    emailVerified: boolean;
    authReady: boolean;
    isLoggedIn: boolean;
    loginUser: (email: string, roles?: string[], emailVerified?: boolean) => void;
    setEmailVerified: (verified: boolean) => void;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [emailVerified, setEmailVerifiedState] = useState(true);
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
                setEmailVerifiedState(data.emailVerified);
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

    function loginUser(
        userEmail: string,
        userRoles: string[] = [],
        verified: boolean = true
    ) {
        localStorage.setItem("email", userEmail);

        setEmail(userEmail);
        setRoles(userRoles);
        setEmailVerifiedState(verified);
        setIsLoggedIn(true);

        if (!verified) {
            router.replace("/verify-email");
            return;
        }

        router.replace(userRoles.includes("Vendor") ? "/vendor" : "/");
    }

    function setEmailVerified(verified: boolean) {
        setEmailVerifiedState(verified);
    }

    async function logoutUser() {
        try {
            await logoutRequest();
        } catch {
            // proceed with local cleanup even if server call fails
        }

        localStorage.removeItem("email");
        clearUserCache();

        setEmail(null);
        setRoles([]);
        setEmailVerifiedState(true);
        setIsLoggedIn(false);

        router.replace("/login");
    }

    return (
        <AuthContext.Provider
            value={{
                email,
                initials,
                roles,
                emailVerified,
                authReady,
                isLoggedIn,
                loginUser,
                setEmailVerified,
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
