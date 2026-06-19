import { api } from "./api";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(
    request: LoginRequest
): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
        "/Auth/login",
        request
    );

    return response.data;
}

export function saveAuth(token: string) {
    localStorage.setItem("token", token);
}

export function logout() {
    localStorage.removeItem("token");
}