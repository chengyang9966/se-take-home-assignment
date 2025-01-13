export interface Order {
    id: string;
    orderNumber: number;
    type: "NORMAL" | "VIP";
    status: "PENDING" | "PROCESSING" | "COMPLETED";
    createdAt: string;
    updatedAt: string;
    orderProcessingTime: number;
}