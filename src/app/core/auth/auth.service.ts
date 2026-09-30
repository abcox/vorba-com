import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, finalize, shareReplay, switchMap } from 'rxjs/operators';
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

interface ExperimentalRefreshTokenRequestDto extends RefreshTokenRequestDto {
  experimentalAccessTokenDurationSeconds?: number;
  experimentalRefreshTokenDurationSeconds?: number;
}

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
  private readonly PROACTIVE_REFRESH_LEAD_SECONDS_KEY =
    'auth_proactive_refresh_lead_seconds';

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
  private refreshInFlight$: Observable<boolean> | null = null;
  private proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly DEFAULT_PROACTIVE_REFRESH_LEAD_SECONDS = 10;
  private readonly MIN_PROACTIVE_REFRESH_LEAD_SECONDS = 1;
  private readonly MAX_PROACTIVE_REFRESH_LEAD_SECONDS = 300;
  private proactiveRefreshLeadSeconds = this.getStoredProactiveRefreshLeadSeconds();

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
        this.restoreActivityConfig(activityConfig);
        this.scheduleProactiveRefresh();
      } else {
        if (!refreshToken) {
          // Expired access token without refresh token fallback
          console.log('🚨 AuthService: Stored token is expired and no refresh token exists, clearing session');
          this.clearStoredData();
          return;
        }

        // Keep user context while trying startup refresh.
        this.updateAuthState({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isAdmin: user.isAdmin,
          tokenExpiry,
        });
        this.restoreActivityConfig(activityConfig);

        console.log('♻️ AuthService: Access token expired at startup, attempting refresh token recovery');
        this.refreshAccessToken().subscribe((success) => {
          if (!success) {
            console.log('🚨 AuthService: Startup token recovery failed, clearing session');
            this.clearStoredData();
            this.updateAuthState({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isAdmin: false,
              tokenExpiry: null,
            });
            this.activityConfig.set(null);
            this.clearProactiveRefreshTimer();
          }
        });
      }
    }
  }

  private restoreActivityConfig(activityConfig: IdelSessionConfigDto | null): void {
    if (activityConfig) {
      console.log('⚙️ AuthService: Restoring activity config from storage:', activityConfig);
      this.activityConfig.set({ ...activityConfig /* , warningCountdownSeconds: 300 */ });
      return;
    }

    console.log('⚠️ AuthService: No stored activity config found, using defaults');
    // Set default activity config — 0 = disabled (no idle timeout)
    this.activityConfig.set({
      inactivityWarningSeconds: 0,
      warningCountdownSeconds: 0,
    });
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
        if (!response.success || !response.token || !response.refreshToken || !response.user) {
          throw new Error(response.message || 'Login failed');
        }

        // Store credentials if remember me is checked
        if (credentials.rememberMe) {
          this.setRememberMe(true);
        }

        // Store tokens and user data
        this.storeTokens(response.token, response.refreshToken);
        this.storeUser(response.user);

        // Update auth state
        this.updateAuthState({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isAdmin: response.user?.isAdmin ?? false,
          tokenExpiry: this.getTokenExpiryFromToken(response.token)
        });
        this.scheduleProactiveRefresh();

        // Pass activity configuration to activity service
        if (response.activityConfig) {
          console.log('⚙️ AuthService: Setting activity config from login response:', response.activityConfig);
          this.activityConfig.set(response.activityConfig);
          this.storeActivityConfig(response.activityConfig);
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
  register(request: UserRegistrationRequest): Observable<UserRegistrationResponse> {
    return this.authApiService.authControllerRegister(request).pipe(
      map((response: UserRegistrationResponse) => {
        console.log('authControllerRegister response', response);
        if (response.requiresAuthentication) {
          return response;
        }
        if (!response.success || !response.token || !response.refreshToken || !response.user) {
          throw new Error(response.message || 'Registration failed');
        }

        // Auto-login after successful registration
        this.storeTokens(response.token, response.refreshToken);
        this.storeUser(response.user);

        this.updateAuthState({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isAdmin: response.user.isAdmin,
          tokenExpiry: this.getTokenExpiryFromToken(response.token)
        });
        this.scheduleProactiveRefresh();

        // Pass activity configuration to activity service
        if (response.activityConfig) {
          console.log('⚙️ AuthService: Setting activity config from register response:', response.activityConfig);
          this.activityConfig.set(response.activityConfig);
          this.storeActivityConfig(response.activityConfig);
        } else {
          console.log('⚠️ AuthService: No activity config in register response');
        }

        return response;
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
    return this.refreshAccessTokenInternal();
  }

  refreshAccessTokenWithDurations(
    accessTokenDurationSeconds: number,
    refreshTokenDurationSeconds: number,
  ): Observable<boolean> {
    if (!this.isAdmin()) {
      return of(false);
    }

    return this.refreshAccessTokenInternal({
      accessTokenDurationSeconds,
      refreshTokenDurationSeconds,
    });
  }

  private refreshAccessTokenInternal(overrides?: {
    accessTokenDurationSeconds?: number;
    refreshTokenDurationSeconds?: number;
  }): Observable<boolean> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const currentRefreshToken = this.refreshToken() || this.getStoredRefreshToken();
    if (!currentRefreshToken) {
      return of(false);
    }

    const refreshTokenRequest: ExperimentalRefreshTokenRequestDto = {
      refreshToken: currentRefreshToken,
      experimentalAccessTokenDurationSeconds:
        overrides?.accessTokenDurationSeconds,
      experimentalRefreshTokenDurationSeconds:
        overrides?.refreshTokenDurationSeconds,
    };

    const refreshRequest$ = overrides
      ? this.authApiService.authControllerRefreshTokenAdminExperiment(
          refreshTokenRequest,
        )
      : this.authApiService.authControllerRefreshToken(refreshTokenRequest);

    this.refreshInFlight$ = refreshRequest$.pipe(
      switchMap((response: RefreshTokenResponseDto) => {
        if (response.success && response.accessToken && response.refreshToken) {
          this.storeTokens(response.accessToken, response.refreshToken);

          const tokenExpiry = this.getTokenExpiryFromToken(response.accessToken);
          const tokenRoles = this.getRolesFromToken(response.accessToken);
          const currentUser = this._authState().user;
          const isAdminFromToken = tokenRoles.includes('admin');

          const refreshedUser = currentUser
            ? {
                ...currentUser,
                roles: tokenRoles.length ? tokenRoles : currentUser.roles,
                isAdmin: isAdminFromToken,
              }
            : currentUser;

          if (refreshedUser) {
            this.storeUser(refreshedUser);
          }

          this.updateAuthState({
            ...this._authState(),
            user: refreshedUser,
            token: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isAdmin: isAdminFromToken,
            tokenExpiry,
          });
          this.scheduleProactiveRefresh();
          return of(true);
        }

        return of(false);
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        return of(false);
      }),
      finalize(() => {
        this.refreshInFlight$ = null;
      }),
      shareReplay(1),
    );

    return this.refreshInFlight$;
  }

  /**
   * Logout user and clear all stored data
   */
  logout(): void {
    console.log('🔐 AuthService: Logging out');
    this.clearProactiveRefreshTimer();
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
   * Update the stored inactivity notice configuration.
   */
  setActivityConfig(config: IdelSessionConfigDto | null): void {
    this.activityConfig.set(config);

    const storage = this.getRememberMe() ? localStorage : sessionStorage;
    storage.removeItem(this.ACTIVITY_CONFIG_KEY);

    if (config) {
      this.storeActivityConfig(config);
    }
  }

  /**
   * Enable the inactivity notice using default durations.
   */
  enableDefaultActivityConfig(): void {
    this.setActivityConfig({
      inactivityWarningSeconds: 600,
      warningCountdownSeconds: 300,
    });
  }

  /**
   * Disable inactivity notice monitoring.
   */
  disableActivityConfig(): void {
    this.setActivityConfig({
      inactivityWarningSeconds: 0,
      warningCountdownSeconds: 0,
    });
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
          const tokenRoles = this.getRolesFromToken(token);
          this.updateAuthState({
            user: {
              ...response.data,
              roles: tokenRoles.length ? tokenRoles : response.data.roles,
              isAdmin: tokenRoles.includes('admin'),
            },
            token,
            refreshToken: this.getStoredRefreshToken(),
            isAuthenticated: true,
            isAdmin: tokenRoles.includes('admin'),
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

  getProactiveRefreshLeadSeconds(): number {
    return this.proactiveRefreshLeadSeconds;
  }

  setProactiveRefreshLeadSeconds(seconds: number): void {
    const safeSeconds = this.clampProactiveRefreshLeadSeconds(seconds);
    this.proactiveRefreshLeadSeconds = safeSeconds;

    const storage = this.getRememberMe() ? localStorage : sessionStorage;
    storage.setItem(
      this.PROACTIVE_REFRESH_LEAD_SECONDS_KEY,
      safeSeconds.toString(),
    );

    this.scheduleProactiveRefresh();
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
  resetPassword(token: string, _newPassword: string): Observable<boolean> {
    void _newPassword;
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

  private scheduleProactiveRefresh(): void {
    this.clearProactiveRefreshTimer();

    const expiry = this.tokenExpiry();
    const refreshToken = this.refreshToken() || this.getStoredRefreshToken();

    if (!expiry || !refreshToken || !this.isAuthenticated()) {
      return;
    }

    const refreshInMs =
      expiry.getTime() -
      Date.now() -
      this.proactiveRefreshLeadSeconds * 1000;
    const delayMs = Math.max(0, refreshInMs);

    this.proactiveRefreshTimer = setTimeout(() => {
      if (!this.isAuthenticated()) {
        return;
      }

      this.refreshAccessToken().subscribe((success) => {
        if (!success) {
          console.log('⚠️ AuthService: Proactive token refresh failed; keeping current session until the access token is actually rejected');
        }
      });
    }, delayMs);
  }

  private clearProactiveRefreshTimer(): void {
    if (!this.proactiveRefreshTimer) {
      return;
    }

    clearTimeout(this.proactiveRefreshTimer);
    this.proactiveRefreshTimer = null;
  }

  private getStoredProactiveRefreshLeadSeconds(): number {
    const localValue = localStorage.getItem(
      this.PROACTIVE_REFRESH_LEAD_SECONDS_KEY,
    );
    const sessionValue = sessionStorage.getItem(
      this.PROACTIVE_REFRESH_LEAD_SECONDS_KEY,
    );
    const rawValue = localValue || sessionValue;

    if (!rawValue) {
      return this.DEFAULT_PROACTIVE_REFRESH_LEAD_SECONDS;
    }

    const parsedValue = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsedValue)) {
      return this.DEFAULT_PROACTIVE_REFRESH_LEAD_SECONDS;
    }

    return this.clampProactiveRefreshLeadSeconds(parsedValue);
  }

  private clampProactiveRefreshLeadSeconds(seconds: number): number {
    if (!Number.isFinite(seconds)) {
      return this.DEFAULT_PROACTIVE_REFRESH_LEAD_SECONDS;
    }

    const roundedSeconds = Math.floor(seconds);

    return Math.min(
      this.MAX_PROACTIVE_REFRESH_LEAD_SECONDS,
      Math.max(this.MIN_PROACTIVE_REFRESH_LEAD_SECONDS, roundedSeconds),
    );
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

  private getRolesFromToken(token: string): string[] {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
      const rawRoles = payload['roles'];
      if (Array.isArray(rawRoles)) {
        return Array.from(new Set(rawRoles.filter((role): role is string => typeof role === 'string' && role.length > 0)));
      }

      if (typeof rawRoles === 'string') {
        return rawRoles
          .split(',')
          .map((role) => role.trim())
          .filter(Boolean);
      }

      return [];
    } catch {
      return [];
    }
  }
}
