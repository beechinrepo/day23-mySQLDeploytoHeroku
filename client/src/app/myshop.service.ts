import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from './model';

@Injectable()
export class MyShopService {
    constructor(private http: HttpClient) {
    }

    createOrder(order: Order): Promise<any> {
        return this.http.post('/api/order', order)
        .toPromise();
    }

    getOrder(orderId: number): Promise<any> {
        return this.http.get(`/api/order/${orderId}`)
        .toPromise();
    }

    updateOrderDetails(orderId: number, order: Order): Promise<any> {
        return this.http.post(`/api/order/${orderId}`, order)
        .toPromise();
    }

}

