import { Injectable, inject, signal, effect } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { DialogService } from '../../component/dialog/dialog.service';
import { Router } from '@angular/router';

export interface ActivityConfig {
  warningBeforeTokenExpiry: number; // milliseconds
  refreshBeforeTokenExpiry: number; // milliseconds
  activityTimeoutMultiplier: number; // 0.8 = 80% of token duration
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  // Configuration - will be set from server response
  private config: ActivityConfig = {
    warningBeforeTokenExpiry: 300000, // 5 minutes default
    refreshBeforeTokenExpiry: 600000, // 10 minutes default
    activityTimeoutMultiplier: 0.8 // 80% default
  };

  // State
  private lastActivity = signal<number>(Date.now());
  private warningTimer?: number;
  private isWarningShown = false;
  private activityHandler: (() => void) | null = null;
  private listenersActive = false;
  private lastActivityLogTime?: number;

  // Public flag for other services to check
  public readonly isShowingWarningDialog = signal<boolean>(false);

  constructor() {
    console.log('🔄 ActivityService: Initializing...');
    
    // Make service globally accessible for debugging
    (window as any).activityService = this;
    
    // React to activity config changes - config only exists when authenticated
    effect(() => {
      const serverConfig = this.authService.activityConfig();
      
      console.log('🔐 ActivityService: Activity config changed:', serverConfig);
      
      if (serverConfig) {
        console.log('✅ ActivityService: User authenticated with config, setting up listeners and timers...');
        this.updateActivityConfig(serverConfig);
        this.setupActivityListeners();
        this.resetTimers();
      } else {
        console.log('🚪 ActivityService: No config (user not authenticated), cleaning up listeners and timers...');
        this.cleanupActivityListeners();
        this.clearTimers();
        this.isWarningShown = false;
      }
    });
  }

  /**
   * Update activity configuration from server response
   */
  private updateActivityConfig(serverConfig: ActivityConfig): void {
    console.log('⚙️ ActivityService: Updating config from server:', serverConfig);
    this.config = {
      warningBeforeTokenExpiry: serverConfig.warningBeforeTokenExpiry || 300000,
      refreshBeforeTokenExpiry: serverConfig.refreshBeforeTokenExpiry || 600000,
      activityTimeoutMultiplier: serverConfig.activityTimeoutMultiplier || 0.8
    };
    
    console.log('✅ ActivityService: Config updated:', this.config);
  }

  /**
   * Check if current token is expired
   */
  private isTokenExpired(): boolean {
    const tokenExpiry = this.authService.getTokenExpiry();
    if (!tokenExpiry) {
      return true; // No expiry = expired
    }
    
    const now = new Date();
    const isExpired = tokenExpiry < now;
    
    if (isExpired) {
      console.log('🚨 ActivityService: Token is expired:', tokenExpiry, 'Current time:', now);
    }
    
    return isExpired;
  }

  /**
   * Get activity timeout based on server config
   */
  private getActivityTimeout(): number {
    // Check if token is expired first
    if (this.isTokenExpired()) {
      console.log('⚠️ ActivityService: Token expired, not setting activity timeout');
      return 0;
    }
    
    // Simply use the server's warning time - no complex calculations
    const activityTimeout = this.config.warningBeforeTokenExpiry;
    console.log('⏰ ActivityService: Using server config for activity timeout:', activityTimeout, 'ms');
    return activityTimeout;
  }

  /**
   * Update user activity timestamp and reset timers
   */
  updateActivity(): void {
    const now = Date.now();
    // Only log activity every 30 seconds to reduce noise
    const timeSinceLastLog = now - (this.lastActivityLogTime || 0);
    if (timeSinceLastLog > 30000) {
      console.log('👆 ActivityService: User activity detected at:', new Date(now));
      this.lastActivityLogTime = now;
    }
    
    // Always log when activity resets timers (this is important!)
    console.log('🔄 ActivityService: Resetting timers due to activity');
    
    this.lastActivity.set(now);
    this.resetTimers();
    this.isWarningShown = false;
  }

  /**
   * Get time since last activity in milliseconds
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity();
  }

  /**
   * Get time until activity timeout in milliseconds
   */
  getTimeUntilTimeout(): number {
    return this.getActivityTimeout() - this.getTimeSinceLastActivity();
  }

  /**
   * Check if user is currently active (within timeout period)
   */
  isUserActive(): boolean {
    return this.getTimeSinceLastActivity() < this.getActivityTimeout();
  }

  /**
   * Set up global activity listeners
   */
  private setupActivityListeners(): void {
    if (this.listenersActive) {
      console.log('⚠️ ActivityService: Listeners already active, skipping setup');
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    console.log('👂 ActivityService: Adding listeners for events:', events);
    
    // Create a single handler function that we can reference for cleanup
    this.activityHandler = () => {
      this.updateActivity();
    };
    
    events.forEach(event => {
      document.addEventListener(event, this.activityHandler as EventListener, { passive: true });
    });
    
    this.listenersActive = true;
    console.log('✅ ActivityService: Activity listeners activated');
  }

  /**
   * Clean up activity listeners
   */
  private cleanupActivityListeners(): void {
    if (!this.listenersActive || !this.activityHandler) {
      console.log('⚠️ ActivityService: No active listeners to clean up');
      return;
    }

    console.log('🧹 ActivityService: Cleaning up activity listeners...');
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.removeEventListener(event, this.activityHandler as EventListener);
    });
    
    this.listenersActive = false;
    this.activityHandler = null;
    console.log('✅ ActivityService: Activity listeners deactivated');
  }

  /**
   * Reset all timers
   */
  private resetTimers(): void {
    console.log('🔄 ActivityService: Resetting all timers...');
    this.clearTimers();
    this.scheduleActivityTimeout();
    // No refresh scheduling - that's AuthService's responsibility
  }

  /**
   * Clear all active timers
   */
  private clearTimers(): void {
    console.log('🧹 ActivityService: Clearing existing timers...');
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = undefined;
      console.log('✅ ActivityService: Warning timer cleared');
    }
  }

  /**
   * Schedule activity warning
   */
  private scheduleActivityTimeout(): void {
    // Check if token is expired
    if (this.isTokenExpired()) {
      console.log('🚨 ActivityService: Token expired, logging out user immediately');
      this.authService.logout();
      this.router.navigate(['/']);
      return;
    }
    
    const warningTime = this.config.warningBeforeTokenExpiry;
    
    console.log('⏰ ActivityService: Scheduling warning timer for:', warningTime, 'ms');
    console.log('⏰ ActivityService: Warning will happen at:', new Date(Date.now() + warningTime));
    
    // Schedule warning dialog
    this.warningTimer = window.setTimeout(() => {
      console.log('⚠️ ActivityService: WARNING TIMER TRIGGERED!');
      this.showActivityWarning();
    }, warningTime);
    console.log('✅ ActivityService: Warning scheduled for', new Date(Date.now() + warningTime));
  }

  /**
   * Handle activity timeout
   */
  private handleActivityTimeout(): void {
    console.log('🚨 ActivityService: Activity timeout - logging out user');
    this.authService.logout();
    this.router.navigate(['/']);
  }

  /**
   * Show activity warning dialog
   */
  private showActivityWarning(): void {
    if (this.isWarningShown) {
      console.log('⚠️ ActivityService: Warning already shown, skipping...');
      return;
    }
    
    this.isWarningShown = true;
    this.isShowingWarningDialog.set(true);
    console.log('⚠️ ActivityService: Showing activity warning dialog');
    
    // Use configurable warning duration from server, or default to 30 seconds
    const warningDuration = Math.floor(this.config.warningBeforeTokenExpiry / 1000) || 30; // Convert ms to seconds
    console.log('⏳ ActivityService: Warning duration:', warningDuration, 'seconds');
    
    try {
      // Open activity warning dialog
      console.log('💬 ActivityService: Opening dialog with warningDuration:', warningDuration);
      this.dialogService.openActivityWarningDialog(warningDuration).subscribe({
        next: (result) => {
          console.log('💬 ActivityService: Dialog result received:', result);
          this.isShowingWarningDialog.set(false);
          if (result?.success) {
            // User chose to extend session
            console.log('✅ ActivityService: User chose to extend session');
            this.extendSession();
          } else {
            // User chose to logout
            console.log('🚪 ActivityService: User chose to logout');
            this.authService.logout();
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('❌ ActivityService: Dialog error:', error);
          this.isShowingWarningDialog.set(false);
          this.isWarningShown = false;
        }
      });
    } catch (error) {
      console.error('❌ ActivityService: Error opening dialog:', error);
      this.isShowingWarningDialog.set(false);
      this.isWarningShown = false;
    }
  }

  /**
   * Extend user session
   */
  private extendSession(): void {
    console.log('⏰ ActivityService: Extending user session');
    this.updateActivity();
    // No token refresh here - that's AuthService's responsibility
    console.log('✅ ActivityService: Session extended (activity updated)');
  }

  /**
   * Clean up service on app destroy
   */
  destroy(): void {
    this.clearTimers();
  }

  // Testing methods
  testQuickExpiry(): void {
    console.log('=== QUICK EXPIRY TEST ===');
    console.log('Token expiry:', this.authService.getTokenExpiry());
    console.log('Activity timeout:', this.getActivityTimeout());
    console.log('Time until warning:', this.getTimeUntilTimeout() - this.config.warningBeforeTokenExpiry);
    const tokenExpiry = this.authService.getTokenExpiry();
    if (tokenExpiry) {
      console.log('Time until refresh:', tokenExpiry.getTime() - Date.now() - this.config.refreshBeforeTokenExpiry);
    }
  }

  testActivityTimeout(): void {
    console.log('=== ACTIVITY TIMEOUT TEST ===');
    console.log('Last activity:', new Date(this.lastActivity()));
    console.log('Time since last activity:', this.getTimeSinceLastActivity());
    console.log('Time until timeout:', this.getTimeUntilTimeout());
    console.log('Is user active:', this.isUserActive());
  }

  // Force trigger events for testing
  triggerActivityWarning(): void {
    console.log('🧪 ActivityService: Manually triggering activity warning dialog');
    this.showActivityWarning();
  }

  // Debug method to check current state
  debugState(): void {
    console.log('🔍 ActivityService: Debug State');
    console.log('- Listeners active:', this.listenersActive);
    console.log('- Warning shown:', this.isWarningShown);
    console.log('- Last activity:', new Date(this.lastActivity()));
    console.log('- Time since last activity:', this.getTimeSinceLastActivity(), 'ms');
    console.log('- Activity timeout:', this.getActivityTimeout(), 'ms');
    console.log('- Time until timeout:', this.getTimeUntilTimeout(), 'ms');
    console.log('- Config:', this.config);
    console.log('- Auth service config:', this.authService.activityConfig());
    console.log('- Is authenticated:', this.authService.isAuthenticated());
  }
} 