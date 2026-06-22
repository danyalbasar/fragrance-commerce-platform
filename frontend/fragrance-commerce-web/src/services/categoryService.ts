import { api } from "./api";
import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>("/Categories");
    return response.data;
}