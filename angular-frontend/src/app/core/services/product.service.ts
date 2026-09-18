import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, Review } from '../models/commerce.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getProducts(params?: { category?: string; search?: string; status?: string; limit?: number }): Observable<Product[]> {
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(res => res.data || res || [])
    );
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/slug/${slug}`).pipe(
      map(res => res.product || res)
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.product || res)
    );
  }

  submitReview(productId: string, review: { rating: number; title: string; comment: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${productId}/reviews`, review);
  }
}
