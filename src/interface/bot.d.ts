export interface Bot {
    id: string;
    status: "IDLE" | "PROCESSING";
    orderNumber:number | null;
    createdAt: string;
    updatedAt: string;
    orderId: string | null;
    timeOutId : NodeJS.Timeout | null;
}