import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { TOKEN_KEY } from '../../app.config';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from localStorage
  //const token = localStorage.getItem(TOKEN_KEY);
  const token = authService.getToken();
  console.log('token', token);
  
  // Clone the request and add auth header if token exists
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('request', request);
  }

  // Handle the request and catch errors
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid - clear storage and redirect
        localStorage.removeItem(TOKEN_KEY);
        authService.clearAuthState();
        router.navigate(['/login']);
      } else {
        router.navigate(['/quiz']);
      }
      return throwError(() => error);
    })
  );
}; 