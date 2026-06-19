import { api } from "./api";
import type { Address } from "@/types/address";

export interface CreateAddressRequest {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export async function getAddresses(): Promise<Address[]> {
    const response = await api.get<Address[]>("/Addresses");
    return response.data;
}

export async function createAddress(
    request: CreateAddressRequest
): Promise<Address> {
    const response = await api.post<Address>("/Addresses", request);
    return response.data;
}