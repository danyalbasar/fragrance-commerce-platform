export interface ReviewImage {
    id: string;
    imageUrl: string;
    displayOrder: number;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
    createdAt: string;
    isVerifiedPurchase: boolean;
    images: ReviewImage[];
}

export interface CreateReviewRequest {
    rating: number;
    title?: string;
    comment?: string;
    images: {
        imageUrl: string;
        displayOrder: number;
    }[];
}