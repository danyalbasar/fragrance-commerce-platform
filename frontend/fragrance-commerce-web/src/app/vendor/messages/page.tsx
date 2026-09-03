"use client";

import { useEffect, useState } from "react";
import {
    Check,
    Inbox,
    Mail,
    MailCheck,
    Phone,
} from "lucide-react";
import {
    getContactMessages,
    markContactMessageResolved,
} from "@/services/contactService";
import { getApiResponse } from "@/services/api";
import { EmptyState } from "@/components/common/EmptyState";
import { VendorMessagesSkeleton } from "@/components/common/VendorSkeletons";
import type { ContactMessageResponse } from "@/services/contactService";

type Filter = "all" | "unresolved" | "resolved";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function VendorMessagesPage() {
    const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                setLoading(true);
                const data = await getContactMessages();
                if (!active) return;
                setMessages(data);
            } catch (err) {
                const res = getApiResponse(err);
                if (res?.status === 401 || res?.status === 403) {
                    setError(
                        "You do not have permission to view customer messages."
                    );
                } else {
                    setError("Could not load customer messages.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => {
            active = false;
        };
    }, []);

    async function handleResolve(id: string) {
        setMessage("");
        setError("");
        setResolvingId(id);
        try {
            await markContactMessageResolved(id);
            setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, isResolved: true } : m))
            );
            setMessage("Marked as resolved.");
        } catch {
            setError("Could not mark the message as resolved.");
        } finally {
            setResolvingId(null);
        }
    }

    const filtered = messages.filter((m) => {
        if (filter === "unresolved") return !m.isResolved;
        if (filter === "resolved") return m.isResolved;
        return true;
    });

    const unresolvedCount = messages.filter((m) => !m.isResolved).length;

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--luxury-gold-strong)] sm:tracking-[0.34em]">
                    Vendor Studio
                </p>
                <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                    Customer Messages
                </h1>
                <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                    Review and resolve inquiries sent through the contact page.
                </p>
            </div>

            {error && (
                <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {message && (
                <p role="status" className="border border-[#d7ad62] bg-[#fff6e4] px-4 py-3 text-sm text-[#8a5a12]">
                    {message}
                </p>
            )}

            <div className="flex flex-wrap gap-2">
                {(
                    [
                        { key: "all", label: `All (${messages.length})` },
                        { key: "unresolved", label: `Unresolved (${unresolvedCount})` },
                        { key: "resolved", label: `Resolved (${messages.length - unresolvedCount})` },
                    ] as { key: Filter; label: string }[]
                ).map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilter(tab.key)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                            filter === tab.key
                                ? "bg-[var(--luxury-ink)] text-[var(--luxury-paper)]"
                                : "border border-[#d8c8ad] text-[var(--luxury-muted)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <VendorMessagesSkeleton />
            ) : filtered.length === 0 ? (
                <div className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-10 shadow-[0_18px_50px_rgba(22,18,13,0.08)]">
                    <EmptyState
                        icon={Inbox}
                        title={
                            filter === "all"
                                ? "No messages yet"
                                : filter === "unresolved"
                                ? "All caught up"
                                : "No resolved messages"
                        }
                        description={
                            filter === "all"
                                ? "Customer inquiries sent via the contact page will appear here."
                                : filter === "unresolved"
                                ? "There are no pending customer inquiries."
                                : "Resolved inquiries will appear here."
                        }
                        compact
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((item) => (
                        <article
                            key={item.id}
                            className={`border bg-[var(--luxury-paper)] p-5 shadow-[0_18px_50px_rgba(22,18,13,0.08)] ${item.isResolved ? "border-[#d8c8ad] opacity-70" : "border-[var(--luxury-gold)]"}`}
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold [font-family:var(--font-serif)]">
                                            {item.subject}
                                        </h2>
                                        {item.isResolved ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--luxury-sand)] px-2.5 py-0.5 text-xs font-medium text-[var(--luxury-muted-strong)]">
                                                <MailCheck size={12} />
                                                Resolved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--luxury-gold)] px-2.5 py-0.5 text-xs font-medium text-[var(--luxury-gold-strong)]">
                                                <Mail size={12} />
                                                New
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-2 text-sm font-medium text-[var(--luxury-ink)]">
                                        {item.fullName}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--luxury-muted)]">
                                        <span>{item.email}</span>
                                        {item.phoneNumber && (
                                            <span className="inline-flex items-center gap-1">
                                                <Phone size={12} />
                                                {item.phoneNumber}
                                            </span>
                                        )}
                                        <span>{formatDate(item.createdAt)}</span>
                                    </div>

                                    <p className="mt-3 text-sm leading-7 text-[var(--luxury-muted)]">
                                        {item.message}
                                    </p>
                                </div>

                                {!item.isResolved && (
                                    <button
                                        type="button"
                                        onClick={() => handleResolve(item.id)}
                                        disabled={resolvingId === item.id}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--luxury-ink)] px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition-colors hover:bg-[var(--luxury-moss)] disabled:cursor-not-allowed disabled:bg-[var(--luxury-muted-strong)]"
                                    >
                                        <Check size={16} />
                                        {resolvingId === item.id
                                            ? "Resolving..."
                                            : "Mark Resolved"}
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
