"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getApiResponse } from "@/services/api";
import VendorRoute from "@/components/common/VendorRoute";
import { getBrands } from "@/services/brandService";
import { getCategories } from "@/services/categoryService";
import {
    productService,
    type CreateProductRequest,
    type UpdateProductRequest,
} from "@/services/productService";
import type { Brand } from "@/types/brand";
import type { Category } from "@/types/category";
import type { Product, ProductGender } from "@/types/product";

const genders: ProductGender[] = ["Men", "Women", "Unisex"];

const emptyForm = {
    brandId: "",
    categoryId: "",
    gender: "Unisex" as ProductGender,
    name: "",
    description: "",
    isActive: true,
};

type DraftVariant = {
    id: string;
    variantName: string;
    sku: string;
    mrp: string;
    sellingPrice: string;
    costPrice: string;
    stockQuantity: string;
    file: File | null;
};

type VariantEditForm = {
    variantName: string;
    sku: string;
    mrp: string;
    sellingPrice: string;
    costPrice: string;
    stockQuantity: string;
    isActive: string;
};

type ImageEditForm = {
    displayOrder: string;
    isPrimary: boolean;
};

function createDraftVariant(): DraftVariant {
    return {
        id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
        variantName: "",
        sku: "",
        mrp: "",
        sellingPrice: "",
        costPrice: "",
        stockQuantity: "10",
        file: null,
    };
}

export default function VendorProductEditor({
    productId,
}: {
    productId?: string;
}) {
    const router = useRouter();
    const isEditing = Boolean(productId);

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [product, setProduct] = useState<Product | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [draftVariants, setDraftVariants] = useState<DraftVariant[]>([
        createDraftVariant(),
    ]);
    const [variantEditForms, setVariantEditForms] = useState<Record<string, VariantEditForm>>({});
    const [productImageForms, setProductImageForms] = useState<Record<string, ImageEditForm>>({});
    const [variantImageForms, setVariantImageForms] = useState<Record<string, ImageEditForm>>({});
    const [productFile, setProductFile] = useState<File | null>(null);
    const [variantFiles, setVariantFiles] = useState<Record<string, File | null>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const primaryImage = useMemo(() => {
        if (!product) return "";

        return (
            product.images.find((image) => image.isPrimary)?.imageUrl ||
            product.images[0]?.imageUrl ||
            product.variants[0]?.images[0]?.imageUrl ||
            ""
        );
    }, [product]);

    async function loadEditor() {
        try {
            setLoading(true);
            setError("");

            const [brandData, categoryData] = await Promise.all([
                getBrands(),
                getCategories(),
            ]);

            setBrands(brandData);
            setCategories(categoryData);

            if (productId) {
                const productData = await productService.getById(productId);
                setProduct(productData);
                setForm({
                    ...emptyForm,
                    brandId: productData.brandId,
                    categoryId: productData.categoryId,
                    gender: productData.gender,
                    name: productData.name,
                    description: productData.description || "",
                    isActive: productData.isActive,
                });
                setVariantEditForms(
                    productData.variants.reduce<Record<string, VariantEditForm>>(
                        (forms, variant) => {
                            forms[variant.id] = {
                                variantName: variant.variantName,
                                sku: variant.sku,
                                mrp: String(variant.mrp),
                                sellingPrice: String(variant.sellingPrice),
                                costPrice: String(variant.costPrice),
                                stockQuantity: String(variant.stockQuantity),
                                isActive: String(variant.isActive ?? true),
                            };
                            return forms;
                        },
                        {}
                    )
                );
                setProductImageForms(
                    productData.images.reduce<Record<string, ImageEditForm>>(
                        (forms, image) => {
                            forms[image.id] = {
                                displayOrder: String(image.displayOrder),
                                isPrimary: image.isPrimary,
                            };
                            return forms;
                        },
                        {}
                    )
                );
                setVariantImageForms(
                    productData.variants.reduce<Record<string, ImageEditForm>>(
                        (forms, variant) => {
                            variant.images.forEach((image) => {
                                forms[image.id] = {
                                    displayOrder: String(image.displayOrder),
                                    isPrimary: image.isPrimary,
                                };
                            });
                            return forms;
                        },
                        {}
                    )
                );
            }
        } catch {
            setError("Product editor could not be loaded.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(loadEditor, 0);
        return () => window.clearTimeout(timer);
    }, [productId]);

    function currency(value: number) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value || 0);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");

        try {
            if (isEditing && productId) {
                const request: UpdateProductRequest = {
                    brandId: form.brandId,
                    categoryId: form.categoryId,
                    gender: form.gender,
                    name: form.name,
                    description: form.description,
                    isActive: form.isActive,
                };

                await productService.update(productId, request);

                if (product) {
                    await Promise.all([
                        ...product.variants.map(async (variant) => {
                            const variantForm = variantEditForms[variant.id];
                            if (!variantForm) return;

                            await productService.updateVariant(variant.id, {
                                variantName: variantForm.variantName,
                                sku: variantForm.sku,
                                mrp: Number(variantForm.mrp),
                                sellingPrice: Number(variantForm.sellingPrice),
                                costPrice: Number(variantForm.costPrice),
                                stockQuantity: Number(variantForm.stockQuantity),
                                isActive: variantForm.isActive === "true",
                            });
                        }),
                        ...product.images.map(async (image) => {
                            const imageForm = productImageForms[image.id];
                            if (!imageForm) return;

                            await productService.updateProductImage(image.id, {
                                displayOrder: Number(imageForm.displayOrder),
                                isPrimary: imageForm.isPrimary,
                            });
                        }),
                        ...product.variants.flatMap((variant) =>
                            variant.images.map(async (image) => {
                                const imageForm = variantImageForms[image.id];
                                if (!imageForm) return;

                                await productService.updateVariantImage(image.id, {
                                    displayOrder: Number(imageForm.displayOrder),
                                    isPrimary: imageForm.isPrimary,
                                });
                            })
                        ),
                    ]);

                    if (productFile) {
                        await productService.addProductImage(productId, productFile, true, 1);
                    }

                    await Promise.all(
                        Object.entries(variantFiles).map(async ([variantId, file]) => {
                            if (!file) return;
                            await productService.addVariantImage(variantId, file, true, 1);
                        })
                    );
                }

                setProductFile(null);
                setVariantFiles({});
                setMessage("Product saved.");
                await loadEditor();
            } else {
                const request: CreateProductRequest = {
                    brandId: form.brandId,
                    categoryId: form.categoryId,
                    gender: form.gender,
                    name: form.name,
                    description: form.description,
                    images: [],
                    variants: draftVariants.map((variant) => ({
                        variantName: variant.variantName,
                        sku: variant.sku,
                        mrp: Number(variant.mrp),
                        sellingPrice: Number(variant.sellingPrice),
                        costPrice: Number(variant.costPrice),
                        stockQuantity: Number(variant.stockQuantity),
                        images: [],
                    })),
                };

                const created = await productService.create(request);

                if (productFile) {
                    await productService.addProductImage(created.id, productFile, true, 1);
                }

                await Promise.all(
                    draftVariants.map(async (variant, index) => {
                        const createdVariantId = created.variants[index]?.id;
                        if (!variant.file || !createdVariantId) return;

                        await productService.addVariantImage(
                            createdVariantId,
                            variant.file,
                            true,
                            1
                        );
                    })
                );

                router.replace(`/vendor/products/${created.id}`);
            }
        } catch (err: unknown) {
            const response = getApiResponse(err);
            setError(
                typeof response?.data === "string"
                    ? response.data
                    : "Product could not be saved."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDeactivate() {
        if (!productId) return;

        try {
            setSaving(true);
            setError("");
            await productService.delete(productId);
            router.replace("/vendor");
        } catch (err: unknown) {
            const response = getApiResponse(err);
            setError(
                typeof response?.data === "string"
                    ? response.data
                    : "Product could not be deactivated."
            );
        } finally {
            setSaving(false);
        }
    }

    function updateDraftVariant(
        id: string,
        field: keyof Omit<DraftVariant, "id">,
        value: string | File | null
    ) {
        setDraftVariants((current) =>
            current.map((variant) =>
                variant.id === id ? { ...variant, [field]: value } : variant
            )
        );
    }

    function updateVariantEditForm(
        id: string,
        field: keyof VariantEditForm,
        value: string
    ) {
        setVariantEditForms((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [field]: value,
            },
        }));
    }

    function updateProductImageForm(
        id: string,
        field: keyof ImageEditForm,
        value: string | boolean
    ) {
        setProductImageForms((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [field]: value,
            },
        }));
    }

    function updateVariantImageForm(
        id: string,
        field: keyof ImageEditForm,
        value: string | boolean
    ) {
        setVariantImageForms((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [field]: value,
            },
        }));
    }

    function addDraftVariant() {
        setDraftVariants((current) => [...current, createDraftVariant()]);
    }

    function removeDraftVariant(id: string) {
        setDraftVariants((current) =>
            current.length === 1
                ? current
                : current.filter((variant) => variant.id !== id)
        );
    }

    if (loading) {
        return (
            <VendorRoute>
                <main aria-hidden="true" className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-6 text-[var(--luxury-ink)] sm:py-8 md:px-8">
                    <div className="mx-auto max-w-[1500px]">
                        <div className="mb-2.5 h-4 w-28 animate-pulse rounded bg-[#e5d9c4]" />

                        <div className="mb-6 flex flex-col gap-5 border-b border-[#d8c8ad] pb-6 md:mb-8 md:flex-row md:items-end md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-40 animate-pulse rounded bg-[#e5d9c4]" />

                                <div className="h-8 w-24 animate-pulse rounded-full bg-[#e5d9c4]" />
                            </div>

                            <div className="h-11 w-44 animate-pulse rounded-full bg-[#e5d9c4]" />
                        </div>

                        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
                            <div className="space-y-8">
                                <div className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6">
                                    <div className="h-7 w-44 animate-pulse rounded bg-[#e5d9c4]" />

                                    <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-12 animate-pulse rounded bg-[#e5d9c4] ${i === 2 || i === 3 ? "md:col-span-2" : ""}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6">
                                    <div className="h-7 w-36 animate-pulse rounded bg-[#e5d9c4]" />

                                    <div className="mt-5 space-y-4">
                                        {Array.from({ length: 2 }).map((_, i) => (
                                            <div key={i} className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] p-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="h-4 w-32 animate-pulse rounded bg-[#e5d9c4]" />
                                                    <div className="h-4 w-4 animate-pulse rounded bg-[#e5d9c4]" />
                                                </div>
                                                <div className="mt-4 h-12 animate-pulse rounded bg-[#e5d9c4]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6">
                                    <div className="h-7 w-32 animate-pulse rounded bg-[#e5d9c4]" />

                                    <div className="mt-5 grid grid-cols-3 gap-3">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="aspect-square animate-pulse rounded bg-[#e5d9c4]" />
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[var(--luxury-radius)] border border-[var(--luxury-line)] bg-[var(--luxury-paper)] p-5 shadow-[var(--luxury-shadow-sm)] sm:p-6">
                                    <div className="h-7 w-24 animate-pulse rounded bg-[#e5d9c4]" />

                                    <div className="mt-5 space-y-3">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="h-10 animate-pulse rounded bg-[#e5d9c4]" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </VendorRoute>
        );
    }

    return (
        <VendorRoute>
            <main className="min-h-screen bg-[var(--luxury-ivory)] px-4 py-6 text-[var(--luxury-ink)] sm:py-8 md:px-8">
                <div className="mx-auto max-w-[1500px]">
                    <button
                        type="button"
                        onClick={() => router.push("/vendor")}
                        className="-my-2.5 mb-2.5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--luxury-muted)] transition hover:text-[var(--luxury-gold-strong)] sm:tracking-[0.16em]"
                    >
                        &larr; Back to Products
                    </button>

                    <div className="mb-6 flex flex-col gap-5 border-b border-[#d8c8ad] pb-6 md:mb-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <Link
                                href="/vendor"
                                className="-my-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxury-gold-strong)] hover:text-[var(--luxury-ink)] sm:tracking-[0.22em]"
                            >
                                Vendor Studio
                            </Link>
                            <h1 className="mt-3 text-4xl font-normal [font-family:var(--font-serif)] sm:text-5xl">
                                {isEditing ? "Edit Product" : "Add Product"}
                            </h1>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {isEditing && (
                                confirmingDeactivate ? (
                                    <div
                                        role="alert"
                                        className="rounded-xl border border-red-200 bg-red-50 p-3"
                                    >
                                        <p className="text-sm font-semibold text-red-700">
                                            Deactivate this product permanently?
                                        </p>

                                        <div className="mt-2 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleDeactivate}
                                                disabled={saving}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 px-5 text-sm font-semibold uppercase tracking-[0.1em] text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-[var(--luxury-muted-strong)] sm:tracking-[0.12em]"
                                            >
                                                <Trash2 size={16} />
                                                {saving ? "Deactivating..." : "Yes, Deactivate"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setConfirmingDeactivate(false)
                                                }
                                                disabled={saving}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--luxury-line)] px-5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-ink)] transition hover:border-[var(--luxury-gold-strong)] disabled:cursor-not-allowed disabled:text-[var(--luxury-muted-strong)] sm:tracking-[0.12em]"
                                            >
                                                Keep
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmingDeactivate(true)}
                                        disabled={saving}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 px-5 text-sm font-semibold uppercase tracking-[0.1em] text-red-700 transition hover:bg-red-50 sm:tracking-[0.12em]"
                                    >
                                        <Trash2 size={16} />
                                        Deactivate
                                    </button>
                                )
                            )}
                            <button
                                type="submit"
                                form="vendor-product-form"
                                disabled={saving}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--luxury-ink)] px-6 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--luxury-paper)] transition hover:bg-[var(--luxury-moss)] disabled:cursor-not-allowed disabled:bg-[var(--luxury-muted-strong)] sm:tracking-[0.14em]"
                            >
                                <Save size={16} />
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div
                            role="status"
                            className="mb-6 border border-[#b9c8a8] bg-[#f6fbef] p-4 text-sm text-[#455c2b]"
                        >
                            {message}
                        </div>
                    )}

                    {error && (
                        <div
                            role="alert"
                            className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
                        <form id="vendor-product-form" onSubmit={handleSubmit} className="order-2 space-y-6 xl:order-1">
                            <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-4 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6">
                                <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                    Product Details
                                </h2>
                                <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
                                    <Field
                                        label="Product Name"
                                        value={form.name}
                                        onChange={(value) =>
                                            setForm((current) => ({ ...current, name: value }))
                                        }
                                        required
                                    />
                                    <SelectField
                                        label="Status"
                                        value={String(form.isActive)}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                isActive: value === "true",
                                            }))
                                        }
                                        options={[
                                            { value: "true", label: "Active" },
                                            { value: "false", label: "Inactive" },
                                        ]}
                                    />
                                    <SelectField
                                        label="Brand"
                                        value={form.brandId}
                                        onChange={(value) =>
                                            setForm((current) => ({ ...current, brandId: value }))
                                        }
                                        options={brands.map((brand) => ({
                                            value: brand.id,
                                            label: brand.name,
                                        }))}
                                        required
                                    />
                                    <SelectField
                                        label="Category"
                                        value={form.categoryId}
                                        onChange={(value) =>
                                            setForm((current) => ({ ...current, categoryId: value }))
                                        }
                                        options={categories.map((category) => ({
                                            value: category.id,
                                            label: category.name,
                                        }))}
                                        required
                                    />
                                    <SelectField
                                        label="Gender"
                                        value={form.gender}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                gender: value as ProductGender,
                                            }))
                                        }
                                        options={genders.map((gender) => ({
                                            value: gender,
                                            label: gender,
                                        }))}
                                        required
                                    />
                                    <div className="md:col-span-2">
                                        <TextArea
                                            label="Description"
                                            value={form.description}
                                            onChange={(value) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    description: value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            {!isEditing && (
                                <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-4 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6">
                                    <div>
                                        <div>
                                            <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                                Variants
                                            </h2>
                                            <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                                Add every size, SKU, price, stock count, and optional image before saving.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-5">
                                        {draftVariants.map((variant, index) => (
                                            <div
                                                key={variant.id}
                                                className="border border-[#d8c8ad] bg-[#fffaf2] p-4 sm:p-5"
                                            >
                                                <div className="mb-5 flex items-center justify-between gap-4">
                                                    <h3 className="text-xl font-normal [font-family:var(--font-serif)]">
                                                        Variant {index + 1}
                                                    </h3>

                                                    {draftVariants.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDraftVariant(variant.id)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c8ad] text-red-700 transition hover:border-red-300 hover:bg-red-50"
                                                            aria-label={`Remove variant ${index + 1}`}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2 md:gap-5">
                                                    <Field
                                                        label="Size / Variant"
                                                        value={variant.variantName}
                                                        onChange={(value) =>
                                                            updateDraftVariant(variant.id, "variantName", value)
                                                        }
                                                        required
                                                    />
                                                    <Field
                                                        label="SKU"
                                                        value={variant.sku}
                                                        onChange={(value) =>
                                                            updateDraftVariant(variant.id, "sku", value)
                                                        }
                                                        required
                                                    />
                                                    <Field
                                                        label="MRP"
                                                        type="number"
                                                        value={variant.mrp}
                                                        onChange={(value) =>
                                                            updateDraftVariant(variant.id, "mrp", value)
                                                        }
                                                        required
                                                    />
                                                    <Field
                                                        label="Selling Price"
                                                        type="number"
                                                        value={variant.sellingPrice}
                                                        onChange={(value) =>
                                                            updateDraftVariant(variant.id, "sellingPrice", value)
                                                        }
                                                        required
                                                    />
                                                    <Field
                                                        label="Cost Price"
                                                        type="number"
                                                        value={variant.costPrice}
                                                        onChange={(value) =>
                                                            updateDraftVariant(variant.id, "costPrice", value)
                                                        }
                                                        required
                                                    />
                                                    <Field
                                                        label="Stock"
                                                        type="number"
                                                        value={variant.stockQuantity}
                                                        onChange={(value) =>
                                                            updateDraftVariant(variant.id, "stockQuantity", value)
                                                        }
                                                        required
                                                    />
                                                    <FileField
                                                        label="Variant Image"
                                                        onChange={(file) =>
                                                            updateDraftVariant(variant.id, "file", file)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addDraftVariant}
                                            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-dashed border-[#d8c8ad] px-4 text-sm font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] sm:tracking-[0.12em]"
                                        >
                                            <Plus size={16} />
                                            Add Variant
                                        </button>
                                    </div>
                                </section>
                            )}

                            {isEditing && product && (
                                <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-4 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-6">
                                    <h2 className="text-2xl font-normal [font-family:var(--font-serif)] sm:text-3xl">
                                        Variants
                                    </h2>
                                    <div className="mt-6 space-y-6">
                                        {product.variants.map((variant) => {
                                            const editForm = variantEditForms[variant.id];

                                            return (
                                                <div
                                                    key={variant.id}
                                                    className="border border-[#d8c8ad] bg-[#fffaf2] p-4 sm:p-5"
                                                >
                                                    <div>
                                                        <h3 className="text-xl font-normal [font-family:var(--font-serif)] sm:text-2xl">
                                                            {variant.variantName}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-[var(--luxury-muted)]">
                                                            {variant.sku} / {currency(variant.sellingPrice)}
                                                        </p>
                                                    </div>

                                                    {editForm && (
                                                        <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
                                                            <Field
                                                                label="Size / Variant"
                                                                value={editForm.variantName}
                                                                onChange={(value) =>
                                                                    updateVariantEditForm(variant.id, "variantName", value)
                                                                }
                                                                required
                                                            />
                                                            <Field
                                                                label="SKU"
                                                                value={editForm.sku}
                                                                onChange={(value) =>
                                                                    updateVariantEditForm(variant.id, "sku", value)
                                                                }
                                                                required
                                                            />
                                                            <SelectField
                                                                label="Status"
                                                                value={editForm.isActive}
                                                                onChange={(value) =>
                                                                    updateVariantEditForm(variant.id, "isActive", value)
                                                                }
                                                                options={[
                                                                    { value: "true", label: "Active" },
                                                                    { value: "false", label: "Inactive" },
                                                                ]}
                                                            />
                                                            <Field
                                                                label="MRP"
                                                                type="number"
                                                                value={editForm.mrp}
                                                                onChange={(value) =>
                                                                    updateVariantEditForm(variant.id, "mrp", value)
                                                                }
                                                                required
                                                            />
                                                            <Field
                                                                label="Selling Price"
                                                                type="number"
                                                                value={editForm.sellingPrice}
                                                                onChange={(value) =>
                                                                    updateVariantEditForm(variant.id, "sellingPrice", value)
                                                                }
                                                                required
                                                            />
                                                            <Field
                                                                label="Cost Price"
                                                                type="number"
                                                                value={editForm.costPrice}
                                                                onChange={(value) =>
                                                                    updateVariantEditForm(variant.id, "costPrice", value)
                                                                }
                                                                required
                                                            />
                                                            <Field
                                                                label="Stock"
                                                                type="number"
                                                                value={editForm.stockQuantity}
                                                                onChange={(value) =>
                                                                    updateVariantEditForm(variant.id, "stockQuantity", value)
                                                                }
                                                                required
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="mt-6 border-t border-[#d8c8ad] pt-5">
                                                        <FileField
                                                            label="Upload Variant Image"
                                                            onChange={(file) =>
                                                                setVariantFiles((current) => ({
                                                                    ...current,
                                                                    [variant.id]: file,
                                                                }))
                                                            }
                                                        />
                                                        <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                                                            Selected images upload when you use the top Save button.
                                                        </p>

                                                        <ImageList
                                                            images={variant.images}
                                                            forms={variantImageForms}
                                                            onChange={updateVariantImageForm}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </form>

                        <aside className="order-1 space-y-6 xl:order-2 xl:sticky xl:top-24 xl:self-start">
                            <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-4 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-5">
                                <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                    Media
                                </h2>
                                <div className="relative mt-5 aspect-square overflow-hidden bg-[#efe3d0]">
                                    {primaryImage ? (
                                        <Image
                                            src={primaryImage}
                                            alt={form.name || "Product image"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.18em] text-[var(--luxury-muted-strong)]">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 space-y-3">
                                    <FileField
                                        label="Product Image"
                                        onChange={setProductFile}
                                    />
                                    <p className="text-sm leading-6 text-[var(--luxury-muted)]">
                                        This image uploads to Cloudinary when you use the top Save button.
                                    </p>
                                </div>

                                {product && (
                                    <ImageList
                                        images={product.images}
                                        forms={productImageForms}
                                        onChange={updateProductImageForm}
                                    />
                                )}
                            </section>

                            {product && (
                                <section className="border border-[#d8c8ad] bg-[var(--luxury-paper)] p-4 shadow-[0_18px_50px_rgba(22,18,13,0.08)] sm:p-5">
                                    <h2 className="text-2xl font-normal [font-family:var(--font-serif)]">
                                        Publishing
                                    </h2>
                                    <div className="mt-4 space-y-3 text-sm text-[var(--luxury-muted)]">
                                        <p>Brand: {product.brandName}</p>
                                        <p>Category: {product.categoryName}</p>
                                        <p>Gender: {product.gender}</p>
                                        <p>Status: {product.isActive ? "Active" : "Inactive"}</p>
                                    </div>
                                </section>
                            )}
                        </aside>
                    </div>
                </div>
            </main>
        </VendorRoute>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--luxury-muted)] sm:tracking-[0.16em]">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[#fffaf2] px-3 text-base outline-none transition focus:border-[var(--luxury-gold)]"
            />
        </label>
    );
}

function TextArea({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--luxury-muted)] sm:tracking-[0.16em]">
                {label}
            </span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={5}
                className="mt-2 w-full resize-none border border-[#d8c8ad] bg-[#fffaf2] px-3 py-3 text-base outline-none transition focus:border-[var(--luxury-gold)]"
            />
        </label>
    );
}

function FileField({
    label,
    onChange,
}: {
    label: string;
    onChange: (file: File | null) => void;
}) {
    return (
        <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--luxury-muted)] sm:tracking-[0.16em]">
                {label}
            </span>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                className="mt-2 w-full border border-[#d8c8ad] bg-[#fffaf2] px-3 py-3 text-sm outline-none transition file:mb-2 file:mr-0 file:rounded-full file:border-0 file:bg-[var(--luxury-ink)] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-[var(--luxury-paper)] hover:border-[var(--luxury-gold)] sm:file:mb-0 sm:file:mr-4 sm:file:tracking-[0.1em]"
            />
        </label>
    );
}

function ImageList({
    images,
    forms,
    onChange,
}: {
    images: Array<{ id: string; imageUrl: string; displayOrder: number; isPrimary: boolean }>;
    forms: Record<string, ImageEditForm>;
    onChange: (id: string, field: keyof ImageEditForm, value: string | boolean) => void;
}) {
    if (images.length === 0) {
        return (
            <p className="mt-4 border border-dashed border-[#d8c8ad] p-4 text-sm text-[var(--luxury-muted)]">
                No uploaded images yet.
            </p>
        );
    }

    return (
        <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--luxury-muted)] sm:tracking-[0.16em]">
                Uploaded Images
            </p>
            {images
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((image) => {
                    const form = forms[image.id] || {
                        displayOrder: String(image.displayOrder),
                        isPrimary: image.isPrimary,
                    };

                    return (
                        <div
                            key={image.id}
                            className="grid gap-3 border border-[#d8c8ad] bg-[var(--luxury-paper)] p-3 sm:grid-cols-[86px_1fr] sm:items-center"
                        >
                            <div className="relative h-24 w-full overflow-hidden bg-[#efe3d0] sm:h-20 sm:w-20">
                                <Image
                                    src={image.imageUrl}
                                    alt="Uploaded product image"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                                <label className="block">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--luxury-muted)] sm:tracking-[0.16em]">
                                        Display Order
                                    </span>
                                    <input
                                        type="number"
                                        value={form.displayOrder}
                                        onChange={(e) =>
                                            onChange(image.id, "displayOrder", e.target.value)
                                        }
                                        className="mt-1 h-10 w-full border border-[#d8c8ad] bg-[#fffaf2] px-3 outline-none transition focus:border-[var(--luxury-gold)] sm:w-28"
                                    />
                                </label>

                                <label className="flex h-10 items-center gap-2 text-sm text-[var(--luxury-muted)]">
                                    <input
                                        type="checkbox"
                                        checked={form.isPrimary}
                                        onChange={(e) =>
                                            onChange(image.id, "isPrimary", e.target.checked)
                                        }
                                        className="h-4 w-4 accent-[var(--luxury-gold)]"
                                    />
                                    Primary
                                </label>
                            </div>

                        </div>
                    );
                })}
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--luxury-muted)] sm:tracking-[0.16em]">
                {label}
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="mt-2 h-11 w-full border border-[#d8c8ad] bg-[#fffaf2] px-3 text-base outline-none transition focus:border-[var(--luxury-gold)]"
            >
                <option value="">Select</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
