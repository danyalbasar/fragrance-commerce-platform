"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface VendorRouteProps {
    children: React.ReactNode;
}

export default function VendorRoute({ children }: VendorRouteProps) {
    const router = useRouter();
    const { isLoggedIn, roles, authReady } = useAuth();

    useEffect(() => {
        if (!authReady) return;

        if (!isLoggedIn) {
            router.replace("/login");
        } else if (!roles.includes("Vendor")) {
            router.replace("/");
        }
    }, [authReady, isLoggedIn, roles, router]);

    if (!authReady || !isLoggedIn || !roles.includes("Vendor")) {
        return (
            <main
                aria-hidden="true"
                className="min-h-screen bg-[var(--luxury-ivory)]"
            />
        );
    }

    return <>{children}</>;
}
