import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/commerce.model';

export interface AdminStats {
  totalProducts: number;
  pendingProducts: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getProducts(status: string = 'pending_review', keyword: string = ''): Observable<Product[]> {
    let params = new HttpParams().set('status', status);
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<any>('/api/admin/products', { params }).pipe(
      map(res => res.data || res || [])
    );
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<any>('/api/admin/products?status=all').pipe(
      map(res => {
        const allProds = res.data || [];
        return {
          totalProducts: res.meta?.total || allProds.length,
          pendingProducts: allProds.filter((p: any) => p.status === 'pending_review').length
        };
      })
    );
  }

  moderateProduct(productId: string, status: 'published' | 'rejected'): Observable<any> {
    return this.http.patch<any>(`/api/admin/products/${productId}/status`, { status });
  }
}
