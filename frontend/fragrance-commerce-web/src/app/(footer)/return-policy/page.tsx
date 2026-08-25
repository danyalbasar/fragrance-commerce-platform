import type { Metadata } from "next";
import CmsInfoPage from "@/components/common/CmsInfoPage";
import { buildMetadata } from "@/config/site";

export const metadata: Metadata = buildMetadata({
    title: "Return Policy",
    description:
        "Returns and exchanges at Fragrance Commerce are handled carefully to protect product quality, hygiene, and customer satisfaction.",
    path: "/return-policy",
});

export default function ReturnPolicyPage() {
    return <CmsInfoPage prefix="return" contactCta />;
}
