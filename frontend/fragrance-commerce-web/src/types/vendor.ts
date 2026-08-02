export interface Vendor {
    id: string;
    userId: string;
    businessName: string;
    gstNumber?: string | null;
    address?: string | null;
    isApproved: boolean;
}

export interface CreateVendorRequest {
    businessName: string;
    gstNumber?: string;
    address?: string;
}

export interface TopSellingProduct {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
}

export interface VendorDashboard {
    totalSalesAmount: number;
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalProducts: number;
    lowStockProducts: number;
    topSellingProducts: TopSellingProduct[];
}
