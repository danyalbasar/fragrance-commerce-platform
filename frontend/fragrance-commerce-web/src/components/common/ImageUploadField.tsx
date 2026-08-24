"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/services/uploadService";

interface ImageUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export default function ImageUploadField({
    value,
    onChange,
    label,
    className = "",
}: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setError("");
            setUploading(true);

            try {
                const url = await uploadImage(file);
                onChange(url);
            } catch {
                setError("Upload failed. Try again.");
            } finally {
                setUploading(false);
                if (inputRef.current) inputRef.current.value = "";
            }
        },
        [onChange]
    );

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (!file || !file.type.startsWith("image/")) return;

            setError("");
            setUploading(true);

            try {
                const url = await uploadImage(file);
                onChange(url);
            } catch {
                setError("Upload failed. Try again.");
            } finally {
                setUploading(false);
            }
        },
        [onChange]
    );

    return (
        <div className={className}>
            {label && (
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    {label}
                </span>
            )}

            {/* URL input */}
            <div className="flex gap-2">
                <input
                    type="url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://... or upload below"
                    className="h-10 flex-1 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 text-sm text-white outline-none transition focus:border-[var(--luxury-gold)]"
                />
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#444] bg-[#222] px-3 text-xs font-medium text-white/70 transition hover:border-[var(--luxury-gold)] hover:text-white disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Upload size={14} />
                    )}
                    Upload
                </button>
            </div>

            {/* Drag & drop zone + preview */}
            {value ? (
                <div className="group relative mt-2 aspect-video w-full overflow-hidden rounded-lg border border-[#333]">
                    <Image
                        src={value}
                        alt="Preview"
                        fill
                        sizes="340px"
                        className="object-cover"
                        unoptimized
                    />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className="mt-2 flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#444] bg-[#1a1a1a] transition hover:border-[var(--luxury-gold)] hover:bg-[#1e1e1e]"
                >
                    <Upload size={24} className="text-white/25" />
                    <p className="mt-2 text-[11px] text-white/30">
                        Drag & drop or click to upload
                    </p>
                </div>
            )}

            {error && (
                <p className="mt-1.5 text-[11px] text-red-400">{error}</p>
            )}
        </div>
    );
}
