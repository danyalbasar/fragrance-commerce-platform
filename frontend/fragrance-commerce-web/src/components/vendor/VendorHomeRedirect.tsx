"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function VendorHomeRedirect() {
    const router = useRouter();
    const { authReady, roles } = useAuth();

    useEffect(() => {
        if (authReady && roles.includes("Vendor")) {
            router.replace("/vendor");
        }
    }, [authReady, roles, router]);

    return null;
}
