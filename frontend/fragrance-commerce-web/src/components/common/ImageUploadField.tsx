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
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Centered upload / preview area */}
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className="group relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#444] bg-[#1a1a1a] transition hover:border-[var(--luxury-gold)] hover:bg-[#1e1e1e]"
            >
                {value ? (
                    <>
                        <Image
                            src={value}
                            alt="Preview"
                            fill
                            sizes="340px"
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/45 opacity-0 transition group-hover:opacity-100" />
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            title="Replace image"
                            className="absolute inset-0 z-10 flex items-center justify-center"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white shadow-lg">
                                {uploading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Upload size={14} />
                                )}
                                {uploading ? "Uploading..." : "Upload"}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                            }}
                            title="Remove image"
                            className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                        >
                            <X size={14} />
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 rounded-full border border-[#444] bg-[#222] px-4 py-2 text-xs font-medium text-white/70 transition hover:border-[var(--luxury-gold)] hover:text-white disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Upload size={14} />
                        )}
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-[11px] text-red-400">{error}</p>
            )}
        </div>
    );
}
