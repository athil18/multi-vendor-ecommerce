import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // If the request requires credentials (like Next.js API expects cookies)
  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest).pipe(
    catchError(error => {
      // Handle global 401 Unauthorized errors
      if (error.status === 401) {
        const authService = inject(AuthService);
        authService.currentUser.set(null);
        // Optionally redirect to login page
      }
      return throwError(() => error);
    })
  );
};
