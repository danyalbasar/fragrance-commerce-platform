"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const router = useRouter();
    const { isLoggedIn, roles, authReady } = useAuth();

    useEffect(() => {
        if (!authReady) return;

        if (!isLoggedIn) {
            router.replace("/login");
        } else if (!roles.includes("Admin") && !roles.includes("SuperAdmin")) {
            router.replace("/");
        }
    }, [authReady, isLoggedIn, roles, router]);

    if (!authReady || !isLoggedIn || (!roles.includes("Admin") && !roles.includes("SuperAdmin"))) {
        return (
            <main
                aria-hidden="true"
                className="min-h-screen bg-[var(--luxury-ivory)]"
            />
        );
    }

    return <>{children}</>;
}
