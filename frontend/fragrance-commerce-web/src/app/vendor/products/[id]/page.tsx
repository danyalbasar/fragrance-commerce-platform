import VendorProductEditor from "@/components/vendor/VendorProductEditor";

interface VendorProductEditPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function VendorProductEditPage({
    params,
}: VendorProductEditPageProps) {
    const { id } = await params;

    return <VendorProductEditor productId={id} />;
}
