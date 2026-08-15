export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    userId: string;
    fullName: string;
    email: string;
    roles: string[];
}
