import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { DialogService } from '../../component/dialog/dialog.service';
import { ActivityService } from '../activity/activity.service';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const dialogService = inject(DialogService);
  const activityService = inject(ActivityService);
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
        // Check if ActivityService is showing a warning dialog
        if (activityService.isShowingWarningDialog()) {
          console.log('AuthInterceptor - 401 error but ActivityService is showing warning dialog, skipping automatic logout');
          return throwError(() => error);
        }
        
        // Token expired or invalid - try refresh first
        console.log('AuthInterceptor - 401 error, attempting token refresh');
        
        return authService.refreshAccessToken().pipe(
          switchMap(refreshSuccess => {
            if (refreshSuccess) {
              // Token refreshed successfully, retry original request
              console.log('AuthInterceptor - token refreshed, retrying request');
              const newToken = authService.token();
              const newRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(newRequest);
            } else {
              // Refresh failed, clear auth state and show login dialog
              console.log('AuthInterceptor - token refresh failed, clearing auth state');
              authService.logout();
              
              // Open login dialog instead of redirecting
              return dialogService.openGeneralLoginDialog().pipe(
                switchMap(result => {
                  if (result.success) {
                    console.log('AuthInterceptor - user logged in after 401, retrying request');
                    // Retry the original request with new token
                    const newToken = authService.token();
                    const newRequest = request.clone({
                      setHeaders: {
                        Authorization: `Bearer ${newToken}`
                      }
                    });
                    return next(newRequest);
                  } else {
                    console.log('AuthInterceptor - login cancelled after 401');
                    router.navigate(['/']);
                    return throwError(() => error);
                  }
                })
              );
            }
          })
        );
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