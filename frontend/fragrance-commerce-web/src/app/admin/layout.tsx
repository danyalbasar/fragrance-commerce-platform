import type { Metadata } from "next";
import { buildMetadata } from "@/config/site";
import AdminRoute from "@/components/common/AdminRoute";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = buildMetadata({
    title: "Admin Studio",
    description: "Manage your Fragrance Commerce store.",
    path: "/admin",
    noindex: true,
});

export default function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <AdminRoute>
            <AdminShell>{children}</AdminShell>
        </AdminRoute>
    );
}
