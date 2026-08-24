import { api } from "./api";

export interface SiteSetting {
    id: string;
    key: string;
    value: string;
    description?: string;
}

export async function getSiteSettings(): Promise<SiteSetting[]> {
    const response = await api.get<SiteSetting[]>("/SiteSettings");
    return response.data;
}

export async function getSiteSetting(key: string): Promise<SiteSetting> {
    const response = await api.get<SiteSetting>(`/SiteSettings/${key}`);
    return response.data;
}

export async function getPublicSettings(): Promise<Record<string, string>> {
    const response = await api.get<Record<string, string>>("/SiteSettings/public");
    return response.data;
}

export async function updateSiteSetting(key: string, value: string, description?: string): Promise<void> {
    await api.put(`/SiteSettings/${key}`, { value, description });
}

export async function upsertSiteSetting(key: string, value: string, description?: string): Promise<void> {
    await api.post("/SiteSettings", { key, value, description });
}
