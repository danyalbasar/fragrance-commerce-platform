"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { FlaskConical, LoaderCircle, MessageCircle, Send, Trash2, X } from "lucide-react";
import { chatErrorMessage, chatService, type ChatReply } from "@/services/chatService";
import { formatPrice } from "@/utils/format";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";

type Message = { id: number; role: "user" | "assistant"; text: string; products?: ChatReply["products"]; source?: ChatReply["source"] };
const suggestions = ["What is attar?", "How do I choose an office scent?", "What are base notes?"];

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const [failedQuestion, setFailedQuestion] = useState("");
    const dialogRef = useRef<HTMLElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<AbortController | null>(null);
    const nextId = useRef(0);
    const sending = useRef(false);

    useFocusTrap(dialogRef, open, () => setOpen(false));
    useScrollLock(open);

    useEffect(() => () => requestRef.current?.abort(), []);
    useEffect(() => {
        if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [messages, pending, error, open]);

    async function send(question: string, retry = false) {
        const text = question.trim();
        if (!text || sending.current) return;
        sending.current = true;
        setPending(true);
        setError("");
        setFailedQuestion("");
        setInput("");
        if (!retry) {
            const message: Message = { id: nextId.current++, role: "user", text };
            setMessages(previous => [...previous, message]);
        }
        const controller = new AbortController();
        requestRef.current = controller;
        try {
            const reply = await chatService.send(text, controller.signal);
            if (!controller.signal.aborted) {
                const message: Message = {
                    id: nextId.current++, role: "assistant", text: reply.reply, products: reply.products, source: reply.source,
                };
                setMessages(previous => [...previous, message]);
            }
        } catch (err) {
            if (!controller.signal.aborted) {
                setError(chatErrorMessage(err));
                setFailedQuestion(text);
            }
        } finally {
            if (!controller.signal.aborted) {
                sending.current = false;
                setPending(false);
                inputRef.current?.focus();
            }
        }
    }

    function clear() {
        requestRef.current?.abort();
        sending.current = false;
        setPending(false);
        setMessages([]);
        setError("");
        setFailedQuestion("");
        setInput("");
        inputRef.current?.focus();
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        void send(input);
    }

    // Can be disabled on a production storefront while experimenting locally.
    if (process.env.NEXT_PUBLIC_CHATBOT_ENABLED === "false") return null;

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} aria-label="Open fragrance learning assistant"
                aria-haspopup="dialog" aria-expanded={open} aria-controls="fragrance-chat"
                className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 py-3 text-sm font-medium text-[var(--luxury-paper)] shadow-lg hover:bg-[var(--luxury-moss)]">
                <MessageCircle size={19} aria-hidden="true" /> Ask the house
            </button>
            {open && (
                <div className="fixed inset-0 z-[120] bg-black/30" onClick={() => setOpen(false)}>
                    <section ref={dialogRef} id="fragrance-chat" role="dialog" aria-modal="true" aria-labelledby="chat-title"
                        onClick={event => event.stopPropagation()}
                        className="absolute bottom-3 right-3 flex h-[min(650px,calc(100dvh-24px))] w-[min(410px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-2xl sm:bottom-6 sm:right-6">
                        <header className="flex items-center gap-3 border-b border-[var(--luxury-line)] px-5 py-4">
                            <FlaskConical size={22} className="text-[var(--luxury-gold-strong)]" aria-hidden="true" />
                            <div className="flex-1">
                                <h2 id="chat-title" className="font-serif text-xl">The fragrance lab</h2>
                                <p className="text-xs text-[var(--luxury-muted-strong)]">Your fragrance shopping assistant</p>
                            </div>
                            <button type="button" aria-label="Clear conversation" onClick={clear} className="rounded-full p-2 hover:bg-[var(--luxury-sand)]"><Trash2 size={17} /></button>
                            <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-[var(--luxury-sand)]"><X size={20} /></button>
                        </header>
                        <div className="border-b border-[var(--luxury-line)] bg-[var(--luxury-sand)] px-5 py-3 text-xs leading-relaxed">
                            Experimental answers may be inaccurate. Check product pages and store policies before purchasing.
                        </div>
                        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5">
                            {messages.length === 0 && (
                                <div className="space-y-4">
                                    <p className="font-serif text-2xl">Find your fragrance vocabulary.</p>
                                    <p className="text-sm leading-relaxed text-[var(--luxury-muted-strong)]">Ask a short question about fragrance notes, styles, or wearing a scent.</p>
                                    <div className="flex flex-col items-start gap-2">
                                        {suggestions.map(question => <button key={question} type="button" onClick={() => void send(question)} disabled={pending}
                                            className="rounded-xl border border-[var(--luxury-line)] px-3 py-2 text-left text-sm hover:bg-[var(--luxury-sand)]">{question}</button>)}
                                    </div>
                                </div>
                            )}
                            <div role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions" className="space-y-4">
                                {messages.map(message => (
                                    <div key={message.id} className={message.role === "user" ? "ml-8" : "mr-3"}>
                                        <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--luxury-muted-strong)]">{message.role === "user" ? "You" : message.source === "reviewed-reference" ? "Reviewed reference" : "AI assistant · experimental"}</p>
                                        <p className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-[var(--luxury-ink)] text-[var(--luxury-paper)]" : "bg-[var(--luxury-sand)]"}`}>{message.text}</p>
                                        {!!message.products?.length && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs text-[var(--luxury-muted-strong)]">Catalog matches · live store data</p>
                                                {message.products.map(product => (
                                                    <Link key={product.id} href={`/products/${product.id}`} onClick={() => setOpen(false)}
                                                        className="block rounded-xl border border-[var(--luxury-line)] px-3 py-2 hover:bg-[var(--luxury-sand)]">
                                                        <span className="block text-xs text-[var(--luxury-muted-strong)]">{product.brandName}</span>
                                                        <span className="block text-sm font-medium">{product.name}</span>
                                                        <span className="text-xs">From {formatPrice(product.price)} · {product.inStock ? "In stock" : "Out of stock"}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {pending && <p role="status" className="flex items-center gap-2 text-sm text-[var(--luxury-muted-strong)]"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> The assistant is thinking…</p>}
                            {error && <div role="alert" className="space-y-2 text-sm"><p>{error}</p><button type="button" onClick={() => void send(failedQuestion, true)} disabled={pending} className="underline">Try again</button></div>}
                        </div>
                        <footer className="border-t border-[var(--luxury-line)] px-4 py-3">
                            <form onSubmit={submit} className="flex gap-2">
                                <label htmlFor="chat-question" className="sr-only">Your fragrance question</label>
                                <input ref={inputRef} id="chat-question" value={input} onChange={event => setInput(event.target.value)} maxLength={600}
                                    placeholder="Ask a short fragrance question…"
                                    className="min-w-0 flex-1 border border-[var(--luxury-line)] bg-[var(--luxury-input)] px-3 py-2 text-base sm:text-sm" />
                                <button type="submit" disabled={pending || !input.trim()} aria-label="Send question"
                                    className="rounded-xl bg-[var(--luxury-ink)] px-3 text-[var(--luxury-paper)] disabled:opacity-40"><Send size={18} /></button>
                            </form>
                            <p className="mt-2 text-[10px] text-[var(--luxury-muted-strong)]">This starter model answers one question at a time. Avoid sharing personal details.</p>
                            <nav aria-label="Store help" className="mt-2 flex gap-4 text-xs underline">
                                <Link href="/products" onClick={() => setOpen(false)}>Browse products</Link>
                                <Link href="/return-policy" onClick={() => setOpen(false)}>Returns</Link>
                                <Link href="/contact" onClick={() => setOpen(false)}>Contact us</Link>
                            </nav>
                        </footer>
                    </section>
                </div>
            )}
        </>
    );
}
