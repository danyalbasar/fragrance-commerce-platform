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
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (!isLoggedIn) {
            router.replace("/login");
        }
    }, [isLoggedIn, router]);

    if (!isLoggedIn) {
        return null;
    }

    return <>{children}</>;
}