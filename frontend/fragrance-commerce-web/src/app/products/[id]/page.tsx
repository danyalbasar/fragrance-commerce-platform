import Image from "next/image";
import VariantSelector from "@/components/products/VariantSelector";
import { productService } from "@/services/productService";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  const product = await productService.getById(id);

  const primaryImage =
    product.images.find((i) => i.isPrimary) ?? product.images[0];

  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          {primaryImage && (
            <div className="relative h-[500px] w-full bg-gray-50">
              <Image
                src={primaryImage.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-gray-500">
            {product.brandName}
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            {product.name}
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            {product.description}
          </p>

          <div className="mt-8">
            <VariantSelector variants={product.variants} />
          </div>
        </div>
      </div>
    </main>
  );
}