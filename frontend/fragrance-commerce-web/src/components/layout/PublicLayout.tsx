"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isVendor = pathname.startsWith("/vendor");
    const isAdmin = pathname.startsWith("/admin");
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const { authReady, isLoggedIn, email } = useAuth();

    return (
        <>
            {!isVendor && !isAdmin && (
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
            {!isVendor && !isAdmin && <Footer />}
            {!isVendor && !isAdmin && !isAuthPage && authReady && <ChatWidget key={email ?? "guest"} audience={isLoggedIn ? "customer" : "shopper"} />}
        </>
    );
}
