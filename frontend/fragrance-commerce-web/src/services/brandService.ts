import { api } from "./api";
import type { Brand } from "@/types/brand";

export async function getBrands(): Promise<Brand[]> {
    const response = await api.get<Brand[]>("/Brands");
    return response.data;
}