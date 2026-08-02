import { api } from "./api";
import type { CreateReviewRequest, Review } from "@/types/review";

export async function getProductReviews(
    productId: string
): Promise<Review[]> {
    const response = await api.get<Review[]>(
        `/products/${productId}/reviews`
    );

    return response.data;
}

export async function createProductReview(
    productId: string,
    data: CreateReviewRequest
): Promise<Review> {
    const response = await api.post<Review>(
        `/products/${productId}/reviews`,
        data
    );

    return response.data;
}