import { api } from "./api";
import type { CreateOrderRequest, Order } from "@/types/order";

export async function createOrder(
    request: CreateOrderRequest
): Promise<Order> {
    const response = await api.post<Order>("/Orders", request);
    return response.data;
}

export async function getOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>("/Orders");
    return response.data;
}

export async function getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/Orders/${id}`);
    return response.data;
}

export async function cancelOrder(id: string): Promise<Order> {
    const response = await api.post<Order>(`/Orders/${id}/cancel`);
    return response.data;
}