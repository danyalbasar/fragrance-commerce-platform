import { api } from "./api";
import type {
    CreateVendorRequest,
    Vendor,
    VendorDashboard,
} from "@/types/vendor";

export async function createVendor(
    request: CreateVendorRequest
): Promise<Vendor> {
    const response = await api.post<Vendor>("/Vendors", request);
    return response.data;
}

export async function getVendorDashboard(): Promise<VendorDashboard> {
    const response = await api.get<VendorDashboard>("/vendor/dashboard");
    return response.data;
}
