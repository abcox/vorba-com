import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProfileCardComponent } from '../../profile-card/profile-card.component';
import { AuthService } from '../../../core/auth/auth.service';
import { NotifyService } from '../../../core/notify/notify.service';
import { SessionService, SessionInactivityState } from '../../../core/session/session.service';
import { IdelSessionConfigDto } from '@file-service-api/v1';
import { LayoutService } from '../../layout/_service/layout.service';
import { ThemeService, ThemeSwatch } from '@src/app/services/theme.service';
import { FontPreset, FontService } from '@src/app/services/font.service';

type JwtPayloadRecord = Record<string, unknown> & {
  sub?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  iss?: string;
  aud?: string | string[];
  roles?: string[] | string;
  role?: string[] | string;
  permissions?: string[] | string;
  scope?: string[] | string;
};

interface TokenClaimViewModel {
  key: string;
  value: string;
}

interface TokenDetailsViewModel {
  subject: string;
  issuedAt: Date | null;
  accessDurationSeconds: number;
  refreshDurationSeconds: number;
  estimatedRefreshCycles: number | null;
  accessExpiresAt: Date | null;
  accessTimeRemaining: string;
  refreshExpiresAt: Date | null;
  refreshTimeRemaining: string;
  simulatedAccessExpiresAt: Date | null;
  simulatedAccessTimeRemaining: string;
  simulatedRefreshExpiresAt: Date | null;
  simulatedRefreshTimeRemaining: string;
  roles: string[];
  claims: TokenClaimViewModel[];
  rawPayload: JwtPayloadRecord;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatSlideToggleModule,
    ProfileCardComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  isRefreshingToken = false;
  isExperimentRefreshingToken = false;
  private readonly ACCESS_TOKEN_DURATION_KEY =
    'profile_access_token_duration_seconds';
  private readonly REFRESH_TOKEN_DURATION_KEY =
    'profile_refresh_token_duration_seconds';
  accessTokenDurationSeconds = this.readStoredSeconds(
    this.ACCESS_TOKEN_DURATION_KEY,
    300,
  );
  refreshTokenDurationSeconds = this.readStoredSeconds(
    this.REFRESH_TOKEN_DURATION_KEY,
    14400,
  );

  constructor(
    private readonly authService: AuthService,
    private readonly notifyService: NotifyService,
    private readonly sessionService: SessionService,
    private readonly layoutService: LayoutService,
    private readonly themeService: ThemeService,
    private readonly fontService: FontService,
  ) {}

  get themeContrastLabel(): string {
    return this.layoutService.isLightTheme() ? 'Dark mode' : 'Light mode';
  }

  get isLightThemeSelected(): boolean {
    return this.layoutService.isLightTheme();
  }

  get selectedSwatch(): ThemeSwatch {
    return this.layoutService.swatchSignal();
  }

  get selectedFont(): FontPreset {
    return this.layoutService.fontSignal();
  }

  get swatchOptions() {
    return this.themeService.colorOptions;
  }

  get fontOptions() {
    return this.fontService.fontOptions;
  }

  toggleTheme(): void {
    this.layoutService.toggleTheme();
  }

  setSwatch(value: ThemeSwatch): void {
    this.layoutService.setSwatch(value);
    this.notifyService.info(`Theme color set to ${value}.`);
  }

  setFont(value: FontPreset): void {
    this.layoutService.setFont(value);
    this.notifyService.info(`Font preset set to ${value}.`);
  }

  get sessionInactivityState(): SessionInactivityState {
    return this.sessionService.inactivityNoticeState();
  }

  updateInactivityWarningSeconds(rawValue: number): void {
    this.updateInactivityConfig({ inactivityWarningSeconds: this.coerceSeconds(rawValue) });
  }

  updateWarningCountdownSeconds(rawValue: number): void {
    this.updateInactivityConfig({ warningCountdownSeconds: this.coerceSeconds(rawValue) });
  }

  get proactiveRefreshLeadSeconds(): number {
    return this.authService.getProactiveRefreshLeadSeconds();
  }

  updateProactiveRefreshLeadSeconds(rawValue: number): void {
    const safeValue = this.coerceSeconds(rawValue);
    this.authService.setProactiveRefreshLeadSeconds(safeValue);
    this.notifyService.info(`Proactive refresh lead set to ${safeValue}s.`);
  }

  updateAccessTokenDurationSeconds(rawValue: number): void {
    const safeValue = this.coerceDurationSeconds(rawValue, 300);
    this.accessTokenDurationSeconds = safeValue;
    localStorage.setItem(this.ACCESS_TOKEN_DURATION_KEY, safeValue.toString());
    this.notifyService.info(`Access token duration set to ${safeValue}s.`);
  }

  updateRefreshTokenDurationSeconds(rawValue: number): void {
    const safeValue = this.coerceDurationSeconds(rawValue, 14400);
    this.refreshTokenDurationSeconds = safeValue;
    localStorage.setItem(this.REFRESH_TOKEN_DURATION_KEY, safeValue.toString());
    this.notifyService.info(`Refresh token duration set to ${safeValue}s.`);
  }

  get isAdminUser(): boolean {
    return this.authService.isAdmin();
  }

  get tokenDetails(): TokenDetailsViewModel | null {
    const token = this.authService.token();
    if (!token) {
      return null;
    }

    const payload = this.decodeTokenPayload(token);
    if (!payload) {
      return null;
    }

    const refreshToken = this.authService.refreshToken();
    const refreshPayload = refreshToken ? this.decodeTokenPayload(refreshToken) : null;

    const issuedAt = this.toDate(payload.iat);
    const accessExpiresAt = this.toDate(payload.exp);
    const refreshExpiresAt = this.toDate(refreshPayload?.exp);
    const simulatedAccessExpiresAt = this.addSeconds(
      issuedAt,
      this.accessTokenDurationSeconds,
    );
    const simulatedRefreshExpiresAt = this.addSeconds(
      issuedAt,
      this.refreshTokenDurationSeconds,
    );
    const roles = this.normalizeRoles(payload);
    const claims = this.extractClaims(payload);
    const estimatedRefreshCycles =
      this.accessTokenDurationSeconds > 0
        ? Math.floor(
            this.refreshTokenDurationSeconds / this.accessTokenDurationSeconds,
          )
        : null;

    return {
      subject: typeof payload.sub === 'string' ? payload.sub : 'n/a',
      issuedAt,
      accessDurationSeconds: this.accessTokenDurationSeconds,
      refreshDurationSeconds: this.refreshTokenDurationSeconds,
      estimatedRefreshCycles,
      accessExpiresAt,
      accessTimeRemaining: this.formatTimeRemaining(accessExpiresAt),
      refreshExpiresAt,
      refreshTimeRemaining: this.formatTimeRemaining(refreshExpiresAt),
      simulatedAccessExpiresAt,
      simulatedAccessTimeRemaining: this.formatTimeRemaining(simulatedAccessExpiresAt),
      simulatedRefreshExpiresAt,
      simulatedRefreshTimeRemaining: this.formatTimeRemaining(simulatedRefreshExpiresAt),
      roles,
      claims,
      rawPayload: payload,
    };
  }

  async copyBearerToken(): Promise<void> {
    const token = this.authService.token();

    if (!token) {
      this.notifyService.warning('No bearer token is available. Sign in first.');
      return;
    }

    try {
      await navigator.clipboard.writeText(token);
      this.notifyService.success('Bearer token copied to clipboard.');
    } catch {
      this.notifyService.error('Unable to copy bearer token to clipboard.');
    }
  }

  refreshAccessToken(): void {
    if (this.isRefreshingToken) {
      return;
    }

    this.isRefreshingToken = true;

    this.authService.refreshAccessToken().subscribe({
      next: (success) => {
        if (success) {
          this.notifyService.success('Access token refreshed.');
          return;
        }

        this.notifyService.warning('Token refresh did not succeed.');
      },
      error: () => {
        this.notifyService.error('Unable to refresh access token.');
        this.isRefreshingToken = false;
      },
      complete: () => {
        this.isRefreshingToken = false;
      },
    });
  }

  refreshTokenWithInputDurations(): void {
    if (this.isExperimentRefreshingToken || !this.isAdminUser) {
      return;
    }

    this.isExperimentRefreshingToken = true;

    this.authService
      .refreshAccessTokenWithDurations(
        this.accessTokenDurationSeconds,
        this.refreshTokenDurationSeconds,
      )
      .subscribe({
        next: (success) => {
          if (success) {
            this.notifyService.success(
              'Token refreshed using admin duration overrides.',
            );
            return;
          }

          this.notifyService.warning(
            'Experimental refresh failed. Admin access is required.',
          );
        },
        error: () => {
          this.notifyService.error('Unable to run experimental token refresh.');
          this.isExperimentRefreshingToken = false;
        },
        complete: () => {
          this.isExperimentRefreshingToken = false;
        },
      });
  }

  toggleInactivityNotice(enabled: boolean): void {
    this.sessionService.setInactivityNoticeEnabled(enabled);
    this.notifyService.info(enabled ? 'Inactivity notice enabled.' : 'Inactivity notice disabled.');
  }

  private updateInactivityConfig(partial: Partial<IdelSessionConfigDto>): void {
    const currentConfig = this.sessionInactivityState.config ?? {
      inactivityWarningSeconds: 0,
      warningCountdownSeconds: 0,
    };

    this.sessionService.setInactivityNoticeConfig({
      inactivityWarningSeconds: partial.inactivityWarningSeconds ?? currentConfig.inactivityWarningSeconds,
      warningCountdownSeconds: partial.warningCountdownSeconds ?? currentConfig.warningCountdownSeconds,
    });
  }

  private coerceSeconds(rawValue: number): number {
    if (!Number.isFinite(rawValue)) {
      return 0;
    }

    return Math.max(0, Math.floor(rawValue));
  }

  private coerceDurationSeconds(rawValue: number, fallback: number): number {
    if (!Number.isFinite(rawValue)) {
      return fallback;
    }

    const rounded = Math.floor(rawValue);
    return Math.min(2592000, Math.max(1, rounded));
  }

  private readStoredSeconds(storageKey: string, fallback: number): number {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return fallback;
    }

    const parsed = Number.parseInt(stored, 10);
    return this.coerceDurationSeconds(parsed, fallback);
  }

  signOut(): void {
    this.authService.logout();
  }

  private decodeTokenPayload(token: string): JwtPayloadRecord | null {
    try {
      const payloadSegment = token.split('.')[1];
      if (!payloadSegment) {
        return null;
      }

      const json = this.base64UrlDecode(payloadSegment);
      return JSON.parse(json) as JwtPayloadRecord;
    } catch {
      return null;
    }
  }

  private base64UrlDecode(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);

    return atob(`${normalized}${padding}`);
  }

  private toDate(epochSeconds: unknown): Date | null {
    if (typeof epochSeconds !== 'number' || Number.isNaN(epochSeconds)) {
      return null;
    }

    return new Date(epochSeconds * 1000);
  }

  private addSeconds(baseDate: Date | null, seconds: number): Date | null {
    if (!baseDate || !Number.isFinite(seconds)) {
      return null;
    }

    return new Date(baseDate.getTime() + seconds * 1000);
  }

  private normalizeRoles(payload: JwtPayloadRecord): string[] {
    const roleSources = [payload.roles, payload.role, payload.permissions, payload.scope];
    const roles = roleSources.flatMap((value) => this.toStringList(value));

    return Array.from(new Set(roles)).filter(Boolean);
  }

  private extractClaims(payload: JwtPayloadRecord): TokenClaimViewModel[] {
    const excludedKeys = new Set([
      'sub',
      'exp',
      'iat',
      'nbf',
      'iss',
      'aud',
      'roles',
      'role',
      'permissions',
      'scope',
    ]);

    return Object.entries(payload)
      .filter(([key]) => !excludedKeys.has(key))
      .map(([key, value]) => ({
        key,
        value: this.stringifyClaimValue(value),
      }));
  }

  private stringifyClaimValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.stringifyClaimValue(item)).join(', ');
    }

    if (value && typeof value === 'object') {
      return JSON.stringify(value);
    }

    return 'n/a';
  }

  private toStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((entry) => this.stringifyClaimValue(entry)).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(/[\s,]+/)
        .map((entry) => entry.trim())
        .filter(Boolean);
    }

    if (value === null || value === undefined) {
      return [];
    }

    return [this.stringifyClaimValue(value)].filter(Boolean);
  }

  private formatTimeRemaining(expiresAt: Date | null): string {
    if (!expiresAt) {
      return 'n/a';
    }

    const millisecondsRemaining = expiresAt.getTime() - Date.now();

    if (millisecondsRemaining <= 0) {
      return 'expired';
    }

    const totalSeconds = Math.floor(millisecondsRemaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`;
    }

    return `${seconds}s remaining`;
  }
}