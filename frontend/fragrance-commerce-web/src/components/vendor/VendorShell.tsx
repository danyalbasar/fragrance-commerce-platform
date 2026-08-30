"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import VendorSidebar from "./VendorSidebar";

export default function VendorShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--luxury-ivory)] text-[var(--luxury-ink)]">
            <VendorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
                <div className="mx-auto max-w-6xl px-2 py-8 sm:px-4 lg:px-6 lg:py-10">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8ad] bg-[var(--luxury-paper)] text-[var(--luxury-ink)] shadow-sm lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu size={18} />
                    </button>
                    {children}
                </div>
            </main>
        </div>
    );
}
