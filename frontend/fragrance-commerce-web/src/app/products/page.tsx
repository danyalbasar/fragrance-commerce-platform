import ProductCard from "@/components/products/ProductCard";
import { productService } from "@/services/productService";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const products = await productService.getAll();

    return (
        <main className="min-h-screen bg-neutral-50 p-8">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-4xl font-bold">
                    Products
                </h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}