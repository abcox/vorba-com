import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  AuthService as AuthApiService, 
  UserService,
  UserRegistrationRequest, 
  UserRegistrationResponse,
  UserLoginRequest,
  UserLoginResponse,
  UserDto
} from '@file-service-api/v1';
import { NotifyService } from '../notify/notify.service';

export interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiService = inject(AuthApiService);
  private notifyService = inject(NotifyService);
  private router = inject(Router);
  private userService = inject(UserService);

  // Storage keys
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly REMEMBER_ME_KEY = 'auth_remember_me';

  // Reactive state management
  private readonly _authState = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false
  });

  // Public readonly signals
  readonly authState = this._authState.asReadonly();
  readonly user = computed(() => this._authState().user);
  readonly token = computed(() => this._authState().token);
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly isAdmin = computed(() => this._authState().isAdmin);

  // Behavior subject for components that need observables
  private readonly _authStateSubject = new BehaviorSubject<AuthState>(this._authState());

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state from storage
   */
  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.updateAuthState({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.isAdmin
      });
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<boolean> {
    const loginRequest: UserLoginRequest = {
      email: credentials.email,
      password: credentials.password
    };

    return this.authApiService.authControllerLogin(loginRequest).pipe(
      map((response: UserLoginResponse) => {
        if (!response.success || !response.token) {
          throw new Error(response.message || 'Login failed');
        }

        // Store credentials if remember me is checked
        if (credentials.rememberMe) {
          this.setRememberMe(true);
        }

        // Store token and user data
        this.storeToken(response.token);
        this.storeUser(response.user);

        // Update auth state
        this.updateAuthState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isAdmin: response.user?.isAdmin ?? false
        });

        return true;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        this.notifyService.error('Login failed', error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Register new user
   */
  register(request: UserRegistrationRequest): Observable<boolean> {
    return this.authApiService.authControllerRegister(request).pipe(
      map((response: UserRegistrationResponse) => {
        console.log('authControllerRegister response', response);
        if (!response.success) {
          throw new Error(response.message || 'Registration failed');
        }

        // Auto-login after successful registration
        if (response.token && response.user) {
          this.storeToken(response.token);
          this.storeUser(response.user);

          this.updateAuthState({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isAdmin: response.user.isAdmin
          });
        }

        return true;
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    // Clear stored data
    this.clearStoredData();
    
    // Update auth state
    this.updateAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false
    });

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  /**
   * Refresh authentication state
   */
  refreshAuth(): Observable<boolean> {
    const token = this.getStoredToken();
    if (!token) {
      return of(false);
    }

    // Try to get current user info
    return this.userService.userControllerGetUserByEmail(this.user()?.email || '').pipe(
      map((response) => {
        if (response.success && response.data) {
          this.storeUser(response.data);
          this.updateAuthState({
            user: response.data,
            token,
            isAuthenticated: true,
            isAdmin: response.data.isAdmin
          });
          return true;
        }
        return false;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  /**
   * Change user password
   */
  changePassword(request: PasswordChangeRequest): Observable<boolean> {
    if (request.newPassword !== request.confirmPassword) {
      return throwError(() => new Error('New passwords do not match'));
    }

    // TODO: Implement password change API call
    // This would typically call a backend endpoint like:
    // return this.authApiService.authControllerChangePassword(request).pipe(...)
    
    console.log('Password change requested:', request);
    return of(true);
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<boolean> {
    // TODO: Implement forgot password API call
    // This would typically call a backend endpoint like:
    // return this.authApiService.authControllerForgotPassword({ email }).pipe(...)
    
    console.log('Password reset requested for:', email);
    return of(true);
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<boolean> {
    // TODO: Implement password reset API call
    // This would typically call a backend endpoint like:
    // return this.authApiService.authControllerResetPassword({ token, newPassword }).pipe(...)
    
    console.log('Password reset with token:', token);
    return of(true);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const currentUser = this.user();
    return currentUser?.roles?.includes(role) || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const currentUser = this.user();
    return currentUser?.roles?.some(role => roles.includes(role)) || false;
  }

  /**
   * Get current user as observable
   */
  getCurrentUser(): Observable<UserDto | null> {
    return this._authStateSubject.asObservable().pipe(
      map(state => state.user)
    );
  }

  /**
   * Get authentication state as observable
   */
  getAuthState(): Observable<AuthState> {
    return this._authStateSubject.asObservable();
  }

  // Private helper methods

  private updateAuthState(newState: AuthState): void {
    this._authState.set(newState);
    this._authStateSubject.next(newState);
  }

  private storeToken(token: string): void {
    const storage = this.getRememberMe() ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, token);
  }

  private getStoredToken(): string | null {
    const localToken = localStorage.getItem(this.TOKEN_KEY);
    const sessionToken = sessionStorage.getItem(this.TOKEN_KEY);
    return localToken || sessionToken;
  }

  private storeUser(user: UserDto | null): void {
    if (!user) {
      console.warn('User is null, skipping storage');
      return;
    }
    const storage = this.getRememberMe() ? localStorage : sessionStorage;
    storage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): UserDto | null {
    const localUser = localStorage.getItem(this.USER_KEY);
    const sessionUser = sessionStorage.getItem(this.USER_KEY);
    const userData = localUser || sessionUser;
    
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  private setRememberMe(remember: boolean): void {
    localStorage.setItem(this.REMEMBER_ME_KEY, remember.toString());
  }

  private getRememberMe(): boolean {
    return localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
  }

  private clearStoredData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
  }
} 