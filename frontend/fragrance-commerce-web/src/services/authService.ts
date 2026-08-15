import { api } from "./api";
import type { AuthResponse, LoginRequest } from "@/types/auth";

export async function login(
    request: LoginRequest
): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
        "/Auth/login",
        request
    );

    return response.data;
}

export async function me(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>("/Auth/me");

    return response.data;
}

export async function logout(): Promise<void> {
    await api.post("/Auth/logout");
}
