import { api } from "./api";
import type { Address } from "@/types/address";

export async function getAddresses(): Promise<Address[]> {
    const response = await api.get<Address[]>("/Addresses");
    return response.data;
}

export async function createAddress(data: Partial<Address>): Promise<Address> {
    const response = await api.post<Address>("/Addresses", data);
    return response.data;
}

export async function updateAddress(
    id: string,
    data: Partial<Address>
): Promise<void> {
    await api.put(`/Addresses/${id}`, data);
}

export async function deleteAddress(id: string): Promise<void> {
    await api.delete(`/Addresses/${id}`);
}