"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    token: string | null;
    isLoggedIn: boolean;
    loginUser: (token: string) => void;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        setToken(savedToken);
    }, []);

    function loginUser(newToken: string) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        router.replace("/");
    }

    function logoutUser() {
        localStorage.removeItem("token");
        setToken(null);
        router.replace("/login");
    }

    return (
        <AuthContext.Provider
            value={{
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