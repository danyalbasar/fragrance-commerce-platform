"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminHomepagePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/homepage/editor");
    }, [router]);

    return (
        <div className="flex h-[calc(100vh-65px)] items-center justify-center bg-[var(--luxury-ivory)]">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--luxury-muted)]">
                Opening Online Store editor...
            </p>
        </div>
    );
}
