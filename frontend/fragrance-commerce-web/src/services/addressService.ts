import { api } from "./api";
import type { Address, CreateAddressRequest } from "@/types/address";

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