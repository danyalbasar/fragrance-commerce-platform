import { api } from "./api";
import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    ResendVerificationRequest,
    VerifyEmailRequest,
} from "@/types/auth";

export async function login(
    request: LoginRequest
): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
        "/Auth/login",
        request
    );

    return response.data;
}

export async function register(
    request: RegisterRequest
): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
        "/Auth/register",
        request
    );

    return response.data;
}

export async function verifyEmail(
    request: VerifyEmailRequest
): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
        "/Auth/verify-email",
        request
    );

    return response.data;
}

export async function resendVerification(
    request: ResendVerificationRequest
): Promise<void> {
    await api.post("/Auth/resend-verification", request);
}

export async function me(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>("/Auth/me");

    return response.data;
}

export async function logout(): Promise<void> {
    await api.post("/Auth/logout");
}
