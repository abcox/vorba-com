import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { LoginDialogService } from '../../component/dialog/login-dialog/login-dialog.service';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const loginDialogService = inject(LoginDialogService);
  const router = inject(Router);

  // Get token from auth service
  const token = authService.token();
  console.log('AuthInterceptor - token:', token);
  
  // Clone the request and add auth header if token exists
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('AuthInterceptor - request with auth header:', request.url);
  } else {
    console.log('AuthInterceptor - no token available');
  }

  // Handle the request and catch errors
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('AuthInterceptor - error:', error.status, error.message);
      
      if (error.status === 401) {
        // Token expired or invalid - clear auth state
        console.log('AuthInterceptor - 401 error, clearing auth state');
        authService.logout();
        
        // Open login dialog instead of redirecting
        loginDialogService.openGeneralLoginDialog().subscribe(result => {
          if (result.success) {
            console.log('AuthInterceptor - user logged in after 401, retrying request');
            // Optionally retry the original request here
          } else {
            console.log('AuthInterceptor - login cancelled after 401');
            router.navigate(['/']);
          }
        });
      } else if (error.status === 403) {
        // Forbidden - user doesn't have permission
        console.log('AuthInterceptor - 403 error, insufficient permissions');
        authService.logout();
        router.navigate(['/']);
      }
      
      return throwError(() => error);
    })
  );
}; 