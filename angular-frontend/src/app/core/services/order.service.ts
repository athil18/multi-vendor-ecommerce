import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Order, Address } from '../models/commerce.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) {}

  createAddress(address: Address): Observable<Address> {
    return this.http.post<any>('/api/addresses', address).pipe(
      map(res => res.address || res.data || res)
    );
  }

  placeOrder(orderPayload: {
    orderItems: { productId: string; variantId?: string; quantity: number }[];
    shippingAddressId: string;
    paymentMethod: string;
    couponCode?: string;
  }): Observable<any> {
    return this.http.post<any>('/api/orders', orderPayload).pipe(
      map(res => res.order || res.data || res)
    );
  }

  createPaymentIntent(orderId: string): Observable<any> {
    return this.http.post<any>('/api/payments/intent', { orderId });
  }

  getCustomerOrders(searchQuery?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.set('search', searchQuery);
    }
    return this.http.get<any>('/api/orders', { params }).pipe(
      map(res => res.data || res.orders || res || [])
    );
  }

  getOrderById(orderId: string): Observable<{ order: Order; items: any[] }> {
    return this.http.get<any>(`/api/orders/${orderId}`);
  }
}
