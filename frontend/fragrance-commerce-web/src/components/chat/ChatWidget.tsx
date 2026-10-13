"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { FlaskConical, LoaderCircle, MessageCircle, Send, Trash2, X } from "lucide-react";
import { chatErrorMessage, chatService, vendorChatPeriods, type ChatReply, type CustomerChatData, type VendorChatData, type VendorChatPeriod } from "@/services/chatService";
import { formatPrice } from "@/utils/format";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";

type Message = { id: number; role: "user" | "assistant"; text: string; products?: ChatReply["products"]; source?: ChatReply["source"]; vendorData?: VendorChatData; customerData?: CustomerChatData };

export default function ChatWidget({ audience = "shopper" }: { audience?: "shopper" | "customer" | "vendor" }) {
    const vendor = audience === "vendor";
    const customer = audience === "customer";
    const dialogId = vendor ? "vendor-chat" : "fragrance-chat";
    const suggestions = vendor
        ? ["Summarize my sales and orders", "Which SKUs are low on stock?", "What are my top-selling products?"]
        : customer ? ["Show my order history", "What is the status of my latest order?", "How do I choose an office scent?"]
        : ["What is attar?", "How do I choose an office scent?", "What are base notes?"];
    const [period, setPeriod] = useState<VendorChatPeriod>("30days");
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const [failedQuestion, setFailedQuestion] = useState("");
    const failedOptions = useRef<{ orderId?: string; offset?: number }>({});
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

    async function send(question: string, retry = false, options: { orderId?: string; offset?: number } = {}) {
        const text = question.trim();
        if (!text || sending.current) return;
        sending.current = true;
        setPending(true);
        setError("");
        setFailedQuestion("");
        failedOptions.current = options;
        setInput("");
        if (!retry) {
            const message: Message = { id: nextId.current++, role: "user", text };
            setMessages(previous => [...previous, message]);
        }
        const controller = new AbortController();
        requestRef.current = controller;
        try {
            const reply = vendor ? await chatService.sendVendor(text, period, controller.signal)
                : customer ? await chatService.sendCustomer(text, controller.signal, options.orderId, options.offset)
                : await chatService.send(text, controller.signal);
            if (!controller.signal.aborted) {
                const message: Message = {
                    id: nextId.current++, role: "assistant", text: reply.reply, products: reply.products, source: reply.source, vendorData: reply.vendorData, customerData: reply.customerData,
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
            <button type="button" onClick={() => setOpen(true)} aria-label={vendor ? "Open vendor business assistant" : "Open fragrance learning assistant"}
                aria-haspopup="dialog" aria-expanded={open} aria-controls={dialogId}
                className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[var(--luxury-ink)] px-5 py-3 text-sm font-medium text-[var(--luxury-paper)] shadow-lg hover:bg-[var(--luxury-moss)]">
                <MessageCircle size={19} aria-hidden="true" /> {vendor ? "Ask your business" : "Ask the house"}
            </button>
            {open && (
                <div className="fixed inset-0 z-[120] bg-black/30" onClick={() => setOpen(false)}>
                    <section ref={dialogRef} id={dialogId} role="dialog" aria-modal="true" aria-labelledby={`${dialogId}-title`}
                        onClick={event => event.stopPropagation()}
                        className="absolute bottom-3 right-3 flex h-[min(650px,calc(100dvh-24px))] w-[min(410px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[var(--luxury-line)] bg-[var(--luxury-paper)] shadow-2xl sm:bottom-6 sm:right-6">
                        <header className="flex items-center gap-3 border-b border-[var(--luxury-line)] px-5 py-4">
                            <FlaskConical size={22} className="text-[var(--luxury-gold-strong)]" aria-hidden="true" />
                            <div className="flex-1">
                                <h2 id={`${dialogId}-title`} className="font-serif text-xl">{vendor ? "Your vendor assistant" : "The fragrance lab"}</h2>
                                <p className="text-xs text-[var(--luxury-muted-strong)]">{vendor ? "Sales, inventory, and orders" : customer ? "Fragrances and your orders" : "Your fragrance shopping assistant"}</p>
                            </div>
                            {messages.length > 0 && <button type="button" aria-label="Clear conversation" onClick={clear} className="rounded-full p-2 hover:bg-[var(--luxury-sand)]"><Trash2 size={17} /></button>}
                            <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-[var(--luxury-sand)]"><X size={20} /></button>
                        </header>
                        <div className="border-b border-[var(--luxury-line)] bg-[var(--luxury-sand)] px-5 py-3 text-xs leading-relaxed">
                            {vendor ? "Answers use your own live business data. Check the recorded figures before acting on AI suggestions." : "Experimental answers may be inaccurate. Check product pages and store policies before purchasing."}
                        </div>
                        {vendor && <div className="flex items-center gap-2 border-b border-[var(--luxury-line)] px-5 py-2 text-xs">
                            <label htmlFor="vendor-chat-period">Sales period</label>
                            <select id="vendor-chat-period" value={period} disabled={pending}
                                onChange={event => { clear(); setPeriod(event.target.value as VendorChatPeriod); }}
                                className="min-w-0 flex-1 rounded border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-1">
                                {Object.entries(vendorChatPeriods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <span className="text-[var(--luxury-muted-strong)]">India time</span>
                        </div>}
                        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5">
                            {messages.length === 0 && (
                                <div className="space-y-4">
                                    <p className="font-serif text-2xl">{vendor ? "Understand your business." : customer ? "Your scents. Your orders." : "Find your fragrance vocabulary."}</p>
                                    <p className="text-sm leading-relaxed text-[var(--luxury-muted-strong)]">{vendor ? "Ask about delivered sales, order statuses, stock levels, and top sellers. Inventory always reflects current stock." : customer ? "Ask about fragrances, your order history, or the status and items in a specific order." : "Ask a short question about fragrance notes, styles, or wearing a scent."}</p>
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
                                        {message.vendorData && <VendorFigures data={message.vendorData} close={() => setOpen(false)} />}
                                        {message.customerData && <CustomerOrders data={message.customerData} close={() => setOpen(false)} pending={pending}
                                            ask={(question, options) => void send(question, false, options)} />}
                                        {!!message.products?.length && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs text-[var(--luxury-muted-strong)]">Catalog matches · live store data</p>
                                                {message.products.map(product => (
                                                    <ProductRecommendation key={product.id} product={product} close={() => setOpen(false)} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {pending && <p role="status" className="flex items-center gap-2 text-sm text-[var(--luxury-muted-strong)]"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> The assistant is thinking…</p>}
                            {error && <div role="alert" className="space-y-2 text-sm"><p>{error}</p><button type="button" onClick={() => void send(failedQuestion, true, failedOptions.current)} disabled={pending} className="underline">Try again</button></div>}
                        </div>
                        <footer className="border-t border-[var(--luxury-line)] px-4 py-3">
                            <form onSubmit={submit} className="flex gap-2">
                                <label htmlFor={`${dialogId}-question`} className="sr-only">{vendor ? "Your business question" : "Your fragrance question"}</label>
                                <input ref={inputRef} id={`${dialogId}-question`} value={input} onChange={event => setInput(event.target.value)} maxLength={600}
                                    placeholder={vendor ? "Ask about your sales or stock…" : customer ? "Ask about fragrances or your orders…" : "Ask a short fragrance question…"}
                                    className="min-w-0 flex-1 border border-[var(--luxury-line)] bg-[var(--luxury-input)] px-3 py-2 text-base sm:text-sm" />
                                <button type="submit" disabled={pending || !input.trim()} aria-label="Send question"
                                    className="rounded-xl bg-[var(--luxury-ink)] px-3 text-[var(--luxury-paper)] disabled:opacity-40"><Send size={18} /></button>
                            </form>
                            <p className="mt-2 text-[10px] text-[var(--luxury-muted-strong)]">{vendor ? "Read-only. Your business summaries are processed by Cloudflare AI. Avoid customer personal details." : customer ? "Order facts come from your account. Order records are not sent to AI. Questions are answered independently." : "This starter model answers one question at a time. Avoid sharing personal details."}</p>
                            <nav aria-label={vendor ? "Vendor tools" : "Store help"} className="mt-2 flex gap-4 text-xs underline">
                                <Link href={vendor ? "/vendor/products" : "/products"} onClick={() => setOpen(false)}>{vendor ? "Products" : "Browse products"}</Link>
                                <Link href={vendor ? "/vendor/orders" : "/return-policy"} onClick={() => setOpen(false)}>{vendor ? "Orders" : "Returns"}</Link>
                                {customer && <Link href="/orders" onClick={() => setOpen(false)}>My orders</Link>}
                                <Link href={vendor ? "/vendor" : "/contact"} onClick={() => setOpen(false)}>{vendor ? "Dashboard" : "Contact us"}</Link>
                            </nav>
                        </footer>
                    </section>
                </div>
            )}
        </>
    );
}

function ProductRecommendation({ product, close }: { product: ChatReply["products"][number]; close: () => void }) {
    const [imageFailed, setImageFailed] = useState(false);
    const imageUrl = product.imageUrl && /^https:\/\/res\.cloudinary\.com\//.test(product.imageUrl) ? product.imageUrl : null;
    return <Link href={`/products/${product.id}`} onClick={close}
        className="flex items-center gap-3 rounded-xl border border-[var(--luxury-line)] p-3 hover:bg-[var(--luxury-sand)]">
        <span className="relative flex h-20 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--luxury-sand)]">
            {imageUrl && !imageFailed
                ? <Image src={imageUrl} alt="" fill sizes="72px" className="object-cover" onError={() => setImageFailed(true)} />
                : <FlaskConical size={25} className="text-[var(--luxury-muted-strong)]" aria-hidden="true" />}
        </span>
        <span className="min-w-0">
            <span className="block text-xs text-[var(--luxury-muted-strong)]">{product.brandName}</span>
            <span className="block break-words text-sm font-medium">{product.name}</span>
            <span className="text-xs">From {formatPrice(product.price)} · {product.inStock ? "In stock" : "Out of stock"}</span>
        </span>
    </Link>;
}

function CustomerOrders({ data, close, pending, ask }: {
    data: CustomerChatData; close: () => void; pending: boolean;
    ask: (question: string, options: { orderId?: string; offset?: number }) => void;
}) {
    return <div className="mt-3 space-y-3 text-xs">
        <p className="text-[var(--luxury-muted-strong)]">Your recorded orders · {data.totalOrders} total</p>
        {data.orders.map(order => <div key={order.id} className="space-y-2 rounded-xl border border-[var(--luxury-line)] p-3">
            <p className="break-all font-medium">{order.orderNumber}</p>
            <p>{new Date(order.orderedAtUtc).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} · {order.status}</p>
            <p>Total {formatPrice(order.finalAmount)} · Payment: {order.paymentStatus}</p>
            {order.discountAmount > 0 && <p>Subtotal {formatPrice(order.totalAmount)} · Discount {formatPrice(order.discountAmount)}</p>}
            {order.items.map((item, index) => <p key={index}>{item.productName} · {item.variantName} · {item.quantity} × {formatPrice(item.unitPrice)}</p>)}
            {order.itemCount > order.items.length && <p>Showing {order.items.length} of {order.itemCount} items. Open the full order for all items.</p>}
            <div className="flex flex-wrap gap-3 underline">
                <button type="button" disabled={pending} onClick={() => ask(`Show details for order ${order.orderNumber}`, { orderId: order.id })}>Order details</button>
                <Link href={`/orders/${order.id}`} onClick={close}>Open full order</Link>
            </div>
        </div>)}
        {data.hasMore && <button type="button" disabled={pending} onClick={() => ask("Show more of my order history", { offset: data.offset + data.orders.length })} className="underline">Show older orders</button>}
        <Link href="/orders" onClick={close} className="block underline">View all my orders</Link>
    </div>;
}

function VendorFigures({ data, close }: { data: VendorChatData; close: () => void }) {
    const figures = [
        ["Delivered item sales", formatPrice(data.deliveredItemSales)], ["Orders", String(data.totalOrders)],
        ["Units in stock now", String(data.totalStockUnits)], ["Active low-stock SKUs", String(data.activeLowStockSkus)],
    ];
    return <div className="mt-3 space-y-3 rounded-xl border border-[var(--luxury-line)] p-3 text-xs">
        <p className="font-medium">Recorded figures · {vendorChatPeriods[data.period]}</p>
        <div className="grid grid-cols-2 gap-3">{figures.map(([label, value]) => <div key={label}>
            <p className="text-[var(--luxury-muted-strong)]">{label}</p><p className="mt-1 font-medium">{value}</p>
        </div>)}</div>
        <p className="text-[var(--luxury-muted-strong)]">Gross delivered item sales before order discounts and refunds. Refreshed {new Date(data.asOfUtc).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })} India time.</p>
        {!!data.matchingInventory.length && <div className="space-y-1"><p className="font-medium">Matching inventory · up to 6 SKUs</p>
            {data.matchingInventory.map(item => <Link key={item.sku} href={`/vendor/products/${item.productId}`} onClick={close} className="block underline">
                {item.productName} · {item.variantName} · {item.sku}: {item.stock} units
            </Link>)}
        </div>}
        {!!data.lowStock.length && <div className="space-y-1"><p className="font-medium">Lowest stock · up to 6 active SKUs</p>
            {data.lowStock.map(item => <Link key={item.sku} href={`/vendor/products/${item.productId}`} onClick={close} className="block underline">
                {item.productName} · {item.sku}: {item.stock} units
            </Link>)}
        </div>}
    </div>;
}
