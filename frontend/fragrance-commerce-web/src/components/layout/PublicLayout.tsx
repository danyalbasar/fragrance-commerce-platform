"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isVendor = pathname.startsWith("/vendor");

    return (
        <>
            {!isVendor && (
                <Suspense
                    fallback={
                        <div
                            aria-hidden="true"
                            className="h-[65px] md:h-[73px]"
                        />
                    }
                >
                    <Navbar />
                </Suspense>
            )}
            <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
                {children}
            </div>
            {!isVendor && <Footer />}
        </>
    );
}
