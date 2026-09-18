import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Store, OrderItem } from '../models/commerce.model';

export interface SellerMetrics {
  totalRevenue: number;
  pendingPayout: number;
  totalOrders: number;
  activeProducts: number;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  constructor(private http: HttpClient) {}

  getStore(): Observable<Store | null> {
    return this.http.get<any>('/api/seller/store').pipe(
      map(res => res?.store || res?.data || res || null)
    );
  }

  createStore(storeData: { storeName: string; description: string; logo?: string }): Observable<Store> {
    return this.http.post<any>('/api/seller/store', storeData).pipe(
      map(res => res.store || res.data || res)
    );
  }

  getDashboardMetrics(): Observable<SellerMetrics> {
    return this.http.get<any>('/api/seller/dashboard').pipe(
      map(res => res.metrics || res.data || res || {
        totalRevenue: 0,
        pendingPayout: 0,
        totalOrders: 0,
        activeProducts: 0
      })
    );
  }

  getSellerOrders(): Observable<OrderItem[]> {
    return this.http.get<any>('/api/seller/orders').pipe(
      map(res => res.data || res.orders || res || [])
    );
  }

  updateOrderItemStatus(itemId: string, status: string): Observable<any> {
    return this.http.put<any>(`/api/seller/orders/${itemId}/status`, { status });
  }

  getPayoutStatus(): Observable<any> {
    return this.http.get<any>('/api/payments/payout-status');
  }

  startStripeOnboarding(): Observable<{ url: string }> {
    return this.http.post<any>('/api/payments/onboarding', {});
  }
}
