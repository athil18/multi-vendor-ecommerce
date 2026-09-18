import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { User } from '../models/commerce.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  
  // Reactive Signals
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isLoading = signal<boolean>(true);
  
  isAuthenticated = computed(() => !!this.currentUser() || !!this.token());
  userRole = computed(() => this.currentUser()?.role || 'customer');

  constructor(private http: HttpClient) {
    this.hydrateFromStorage();
    this.checkSession().subscribe();
  }

  private hydrateFromStorage() {
    try {
      const storedUser = localStorage.getItem('nexus_user');
      const storedToken = localStorage.getItem('nexus_token');
      if (storedUser) {
        this.currentUser.set(JSON.parse(storedUser));
      }
      if (storedToken) {
        this.token.set(storedToken);
      }
    } catch (e) {
      console.warn('Could not read auth from localStorage', e);
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.user) {
          this.currentUser.set(response.user);
          this.token.set(response.accessToken || 'session-token');
          localStorage.setItem('nexus_user', JSON.stringify(response.user));
          if (response.accessToken) {
            localStorage.setItem('nexus_token', response.accessToken);
          }
        }
      })
    );
  }

  register(userData: { name: string; email: string; password: string; role?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response.user) {
          this.currentUser.set(response.user);
          this.token.set(response.accessToken || 'session-token');
          localStorage.setItem('nexus_user', JSON.stringify(response.user));
          if (response.accessToken) {
            localStorage.setItem('nexus_token', response.accessToken);
          }
        }
      })
    );
  }

  checkSession(): Observable<any> {
    this.isLoading.set(true);
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        if (response?.user) {
          this.currentUser.set(response.user);
          localStorage.setItem('nexus_user', JSON.stringify(response.user));
        }
        this.isLoading.set(false);
      }),
      catchError(error => {
        // If /me fails but we have localStorage user, keep graceful fallback
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.token.set(null);
        localStorage.removeItem('nexus_user');
        localStorage.removeItem('nexus_token');
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.token.set(null);
        localStorage.removeItem('nexus_user');
        localStorage.removeItem('nexus_token');
        return of(null);
      })
    );
  }
}
