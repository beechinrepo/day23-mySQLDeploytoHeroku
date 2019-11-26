export interface Order {
    order_id?: number;
    email: string;
    orderDetails: OrderDetail[];
}

export interface OrderDetail {
    description: string;
    quantity: number;
    item_id?: number;
}