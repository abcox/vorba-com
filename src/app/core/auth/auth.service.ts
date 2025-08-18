import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  IdelSessionConfigDto,
  AuthService as AuthApiService, 
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
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
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  tokenExpiry: Date | null;
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
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';
  private readonly REMEMBER_ME_KEY = 'auth_remember_me';
  private readonly ACTIVITY_CONFIG_KEY = 'auth_activity_config';

  // Reactive state management
  private readonly _authState = signal<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isAdmin: false,
    tokenExpiry: null
  });

  // Activity configuration signal
  public readonly activityConfig = signal<IdelSessionConfigDto | null>(null);

  // Public readonly signals
  readonly authState = this._authState.asReadonly();
  readonly user = computed(() => this._authState().user);
  readonly token = computed(() => this._authState().token);
  readonly refreshToken = computed(() => this._authState().refreshToken);
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly isAdmin = computed(() => this._authState().isAdmin);
  readonly tokenExpiry = computed(() => this._authState().tokenExpiry);
  readonly isGuest = computed(() => this._authState().user?.roles.includes('guest'));

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
    const refreshToken = this.getStoredRefreshToken();
    const user = this.getStoredUser();
    const activityConfig = this.getStoredActivityConfig();
    
    if (token && user) {
      const tokenExpiry = this.getTokenExpiryFromToken(token);
      
      // Check if token is expired
      if (tokenExpiry && tokenExpiry > new Date()) {
        // Valid session - restore everything
        this.updateAuthState({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isAdmin: user.isAdmin,
          tokenExpiry
        });
        
        // Restore activity config if available
        if (activityConfig) {
          console.log('⚙️ AuthService: Restoring activity config from storage:', activityConfig);
          this.activityConfig.set({...activityConfig/* , warningCountdownSeconds: 300 */ });
        } else {
          console.log('⚠️ AuthService: No stored activity config found, using defaults');
          // Set default activity config for stored sessions
          this.activityConfig.set({
            inactivityWarningSeconds: 30, // 30 seconds
            warningCountdownSeconds: 60, // 60 seconds
          });
        }
      } else {
        // Token expired - clear everything
        console.log('🚨 AuthService: Stored token is expired, clearing session');
        this.clearStoredData();
      }
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

        // Store tokens and user data
        this.storeTokens(response.token, (response as any).refreshToken || '');
        this.storeUser(response.user);

        // Update auth state
        this.updateAuthState({
          user: response.user,
          token: response.token,
          refreshToken: (response as any).refreshToken || null,
          isAuthenticated: true,
          isAdmin: response.user?.isAdmin ?? false,
          tokenExpiry: this.getTokenExpiryFromToken(response.token)
        });

        // Pass activity configuration to activity service
        if ((response as any).activityConfig) {
          console.log('⚙️ AuthService: Setting activity config from login response:', (response as any).activityConfig);
          this.activityConfig.set((response as any).activityConfig);
          this.storeActivityConfig((response as any).activityConfig);
        } else {
          console.log('⚠️ AuthService: No activity config in login response');
        }

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
          this.storeTokens(response.token, (response as any).refreshToken || '');
          this.storeUser(response.user);

          this.updateAuthState({
            user: response.user,
            token: response.token,
            refreshToken: (response as any).refreshToken || null,
            isAuthenticated: true,
            isAdmin: response.user.isAdmin,
            tokenExpiry: this.getTokenExpiryFromToken(response.token)
          });
        }

        // Pass activity configuration to activity service
        if ((response as any).activityConfig) {
          console.log('⚙️ AuthService: Setting activity config from register response:', (response as any).activityConfig);
          this.activityConfig.set((response as any).activityConfig);
          this.storeActivityConfig((response as any).activityConfig);
        } else {
          console.log('⚠️ AuthService: No activity config in register response');
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
   * Refresh access token using refresh token
   */
  refreshAccessToken(): Observable<boolean> {
    const currentRefreshToken = this.refreshToken();
    if (!currentRefreshToken) {
      return of(false);
    }

    const refreshTokenRequest: RefreshTokenRequestDto = {
      refreshToken: currentRefreshToken
    };

    return this.authApiService.authControllerRefreshToken(refreshTokenRequest).pipe(
      map((response: RefreshTokenResponseDto) => {
        if (response.success && response.accessToken) {
          // Store new access token
          this.storeToken(response.accessToken);
          
          // Update auth state with new token
          const tokenExpiry = this.getTokenExpiryFromToken(response.accessToken);
          this.updateAuthState({
            ...this._authState(),
            token: response.accessToken,
            tokenExpiry
          });
          
          return true;
        }
        return false;
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        return of(false);
      })
    );
  }

  /**
   * Logout user and clear all stored data
   */
  logout(): void {
    console.log('🔐 AuthService: Logging out');
    this.clearStoredData();
    this.updateAuthState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      tokenExpiry: null
    });
    this.activityConfig.set(null);
    this.router.navigate(['/']);
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
          const tokenExpiry = this.getTokenExpiryFromToken(token);
          this.updateAuthState({
            user: response.data,
            token,
            refreshToken: this.getStoredRefreshToken(),
            isAuthenticated: true,
            isAdmin: response.data.isAdmin,
            tokenExpiry
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
   * Get token expiry date
   */
  getTokenExpiry(): Date | null {
    return this.tokenExpiry();
  }

  /**
   * Check if token is expired or will expire soon
   */
  isTokenExpired(gracePeriodMs: number = 60000): boolean { // 1 minute grace period
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    return expiry.getTime() - Date.now() < gracePeriodMs;
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

  private storeTokens(token: string, refreshToken: string): void {
    this.storeToken(token);
    this.storeRefreshToken(refreshToken);
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

  private storeRefreshToken(refreshToken: string): void {
    const storage = this.getRememberMe() ? localStorage : sessionStorage;
    storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private getStoredRefreshToken(): string | null {
    const localToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const sessionToken = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
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

  private storeActivityConfig(config: IdelSessionConfigDto | null): void {
    if (!config) {
      console.warn('Activity config is null, skipping storage');
      return;
    }
    const storage = this.getRememberMe() ? localStorage : sessionStorage;
    storage.setItem(this.ACTIVITY_CONFIG_KEY, JSON.stringify(config));
  }

  private getStoredActivityConfig(): IdelSessionConfigDto | null {
    const localConfig = localStorage.getItem(this.ACTIVITY_CONFIG_KEY);
    const sessionConfig = sessionStorage.getItem(this.ACTIVITY_CONFIG_KEY);
    const configData = localConfig || sessionConfig;
    
    if (configData) {
      try {
        return JSON.parse(configData);
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
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ACTIVITY_CONFIG_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.ACTIVITY_CONFIG_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
  }

  private getTokenExpiryFromToken(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }
}
