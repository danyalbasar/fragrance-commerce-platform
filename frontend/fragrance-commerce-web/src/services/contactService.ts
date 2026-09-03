import { api } from "./api";

export interface CreateContactMessageRequest {
    fullName: string;
    email: string;
    phoneNumber?: string;
    subject: string;
    message: string;
}

export interface ContactMessageResponse extends CreateContactMessageRequest {
    id: string;
    isResolved: boolean;
    createdAt: string;
}

export async function createContactMessage(
    request: CreateContactMessageRequest
): Promise<ContactMessageResponse> {
    const response = await api.post<ContactMessageResponse>(
        "/contactmessages",
        request
    );

    return response.data;
}

export async function getContactMessages(
    resolved?: boolean
): Promise<ContactMessageResponse[]> {
    const response = await api.get<ContactMessageResponse[]>(
        "/contactmessages",
        { params: resolved === undefined ? {} : { resolved } }
    );

    return response.data;
}

export async function markContactMessageResolved(
    id: string
): Promise<ContactMessageResponse> {
    const response = await api.put<ContactMessageResponse>(
        `/contactmessages/${id}/resolved`
    );

    return response.data;
}
