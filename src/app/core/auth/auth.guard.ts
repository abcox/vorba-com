import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginDialogService } from '../../component/dialog/login-dialog/login-dialog.service';
import { map, catchError, of, switchMap } from 'rxjs';

export interface AuthGuardConfig {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireRoles?: string[];
  redirectTo?: string;
}

/**
 * Authentication guard for protecting routes
 * 
 * Usage:
 * - Basic auth: canActivate: [authGuard()]
 * - Admin only: canActivate: [authGuard({ requireAdmin: true })]
 * - Specific roles: canActivate: [authGuard({ requireRoles: ['admin', 'moderator'] })]
 * - Custom redirect: canActivate: [authGuard({ redirectTo: '/custom-login' })]
 */
export const authGuard = (config: AuthGuardConfig = {}): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const loginDialogService = inject(LoginDialogService);

    const {
      requireAuth = true,
      requireAdmin = false,
      requireRoles = [],
      redirectTo = '/login'
    } = config;

    // If no authentication required, allow access
    if (!requireAuth) {
      return true;
    }

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      console.log('Auth guard: User not authenticated, opening login dialog');
      
      // Open login dialog instead of redirecting
      if (requireAdmin) {
        return loginDialogService.openAdminLoginDialog(state.url).pipe(
          map(result => {
            if (result.success) {
              // User logged in successfully, check admin status
              if (authService.isAdmin()) {
                return true;
              } else {
                console.log('Auth guard: User is not admin, redirecting to home');
                router.navigate(['/']);
                return false;
              }
            } else {
              // User cancelled login, redirect to home
              console.log('Auth guard: Login cancelled, redirecting to home');
              router.navigate(['/']);
              return false;
            }
          })
        );
      } else {
        return loginDialogService.openGeneralLoginDialog(state.url).pipe(
          map(result => {
            if (result.success) {
              return true;
            } else {
              console.log('Auth guard: Login cancelled, redirecting to home');
              router.navigate(['/']);
              return false;
            }
          })
        );
      }
    }

    // Check admin requirement
    if (requireAdmin && !authService.isAdmin()) {
      console.log('Auth guard: Admin access required, redirecting to home');
      router.navigate(['/']);
      return false;
    }

    // Check role requirements
    if (requireRoles.length > 0 && !authService.hasAnyRole(requireRoles)) {
      console.log('Auth guard: Insufficient permissions, redirecting to home');
      router.navigate(['/']);
      return false;
    }

    // All checks passed
    return true;
  };
};

/**
 * Admin-only guard (shorthand for authGuard with admin requirement)
 */
export const adminGuard = (): CanActivateFn => {
  return authGuard({ requireAdmin: true });
};

/**
 * Role-based guard (shorthand for authGuard with specific roles)
 */
export const roleGuard = (roles: string[]): CanActivateFn => {
  return authGuard({ requireRoles: roles });
};

/**
 * Optional auth guard (allows both authenticated and unauthenticated users)
 * Useful for pages that show different content based on auth status
 */
export const optionalAuthGuard = (): CanActivateFn => {
  return authGuard({ requireAuth: false });
};

/**
 * Async auth guard that refreshes authentication state before checking
 * Useful for routes that need to verify token validity
 */
export const asyncAuthGuard = (config: AuthGuardConfig = {}): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const {
      requireAuth = true,
      requireAdmin = false,
      requireRoles = [],
      redirectTo = '/login'
    } = config;

    // If no authentication required, allow access
    if (!requireAuth) {
      return true;
    }

    // Try to refresh authentication state
    return authService.refreshAuth().pipe(
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          console.log('Async auth guard: Authentication refresh failed, redirecting to login');
          router.navigate([redirectTo], { 
            queryParams: { returnUrl: state.url }
          });
          return false;
        }

        // Check admin requirement
        if (requireAdmin && !authService.isAdmin()) {
          console.log('Async auth guard: Admin access required, redirecting to home');
          router.navigate(['/']);
          return false;
        }

        // Check role requirements
        if (requireRoles.length > 0 && !authService.hasAnyRole(requireRoles)) {
          console.log('Async auth guard: Insufficient permissions, redirecting to home');
          router.navigate(['/']);
          return false;
        }

        // All checks passed
        return true;
      }),
      catchError((error) => {
        console.error('Async auth guard error:', error);
        router.navigate([redirectTo], { 
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      })
    );
  };
}; 