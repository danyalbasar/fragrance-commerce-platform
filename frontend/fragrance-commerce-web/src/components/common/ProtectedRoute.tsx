"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const router = useRouter();
    const { isLoggedIn, authReady } = useAuth();

    useEffect(() => {
        if (authReady && !isLoggedIn) {
            router.replace("/login");
        }
    }, [authReady, isLoggedIn, router]);

    if (!authReady || !isLoggedIn) {
        return null;
    }

    return <>{children}</>;
}
