import { api } from "./api";

export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<{ url: string }>("/Upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.url;
}
