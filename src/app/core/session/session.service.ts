import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Idle,
  DEFAULT_INTERRUPTSOURCES,
  //KeepaliveSvc,
  //EventTargetInterruptSource,
  //KeyboardInterruptSource,
  //MouseInterruptSource,
  //WindowInterruptSource
} from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AuthService } from '../auth/auth.service';
import { DialogService } from '../../component/dialog/dialog.service';

export interface SessionConfig {
  idleTime: number; // seconds
  timeout: number; // seconds
  ping: number; // seconds
  warningTime: number; // seconds before timeout to show warning
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private router = inject(Router);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private idle = inject(Idle);
  private keepalive = inject(Keepalive);

  // Session state signals
  private _sessionState = signal({
    isIdle: false,
    isTimedOut: false,
    isWarning: false,
    idleTime: 0,
    timeUntilTimeout: 0,
    lastActivity: Date.now()
  });
  public readonly sessionState = this._sessionState.asReadonly();

  // Initialization trigger signal
  private _initTrigger = signal(0);

  // Dialog state tracking
  private _warningDialogShown = signal(false);

  // Computed signals
  public readonly isSessionActive = computed(() => {
    return !this.sessionState().isIdle && !this.sessionState().isTimedOut;
  });

  public readonly shouldShowWarning = computed(() => {
    return this.sessionState().isWarning && !this.sessionState().isTimedOut;
  });

  public readonly timeUntilLogout = computed(() => {
    return this.sessionState().timeUntilTimeout;
  });

  constructor() {
    this.setupEffects();
    
    // Trigger initial check for authenticated state
    this._initTrigger.set(1);
  }

  /**
   * Initialize session monitoring with configuration
   * @param config - Session configuration
   * @param config.idleTime - Idle time in seconds
   * @param config.timeout - Timeout in seconds
   * @param config.ping - Ping interval in seconds
   * @param config.warningTime - Warning time in seconds
   */
  initializeSession(config: SessionConfig): void {
    console.log('🔧 SessionService: Initializing with config:', config);

    // Validate config values
    const idleTime = Math.max(1, config.idleTime || 60); // Minimum 1 second
    const timeout = Math.max(1, config.timeout || 30); // Minimum 1 second
    const ping = Math.max(1, config.ping || 30); // Minimum 1 second

    console.log('🔧 Validated config:', { idleTime, timeout, ping });

    // Set idle timeout (when user becomes idle)
    this.idle.setIdle(idleTime);
    
    // Set timeout (when to show warning)
    this.idle.setTimeout(timeout);
    
    // Set keepalive ping interval
    this.keepalive.interval(ping);

    // Set interrupt sources (what events reset the idle timer)
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    // Start monitoring
    this.startMonitoring();
  }

  /**
   * Start monitoring user activity
   */
  private startMonitoring(): void {
    console.log('🚀 SessionService: Starting session monitoring');

    // When user becomes idle
    this.idle.onIdleStart.subscribe(() => {
      console.log('😴 User is now idle');
      this._sessionState.update(state => ({ ...state, isIdle: true }));
    });

    // When user becomes active again
    this.idle.onIdleEnd.subscribe(() => {
      console.log('🎯 User is active again');
      this._sessionState.update(state => ({ 
        ...state, 
        isIdle: false, 
        isWarning: false,
        lastActivity: Date.now() 
      }));
    });

    // When timeout is about to occur (warning)
    this.idle.onTimeoutWarning.subscribe((countdown: number) => {
      //console.log('⚠️ Timeout warning:', countdown, 'seconds remaining');
      this._sessionState.update(state => ({ 
        ...state, 
        isWarning: true,
        timeUntilTimeout: countdown 
      }));
      
      // Show warning dialog only once
      if (!this._warningDialogShown()) {
        this.showTimeoutWarning(countdown);
      }
    });

    // When timeout occurs
    this.idle.onTimeout.subscribe(() => {
      console.log('⏰ Session timeout - logging out user');
      this._sessionState.update(state => ({ 
        ...state, 
        isTimedOut: true,
        isWarning: false 
      }));
      
      this.handleSessionTimeout();
    });

    // Start the idle service
    this.idle.watch();
  }

  /**
   * Show timeout warning dialog
   */
  private showTimeoutWarning(countdown: number): void {
    console.log('⚠️ Showing timeout warning dialog');
    
    // Mark dialog as shown
    this._warningDialogShown.set(true);
    
    this.dialogService.openActivityWarningDialog(countdown).subscribe({
      next: (result) => {
        // Reset dialog state
        this._warningDialogShown.set(false);
        
        if (result?.success) {
          // User chose to extend session
          console.log('✅ User extended session');
          this.extendSession();
        } else {
          // User chose to logout
          console.log('🚪 User chose to logout');
          this.handleSessionTimeout();
        }
      },
      error: (error) => {
        // Reset dialog state
        this._warningDialogShown.set(false);
        console.error('❌ Error in timeout warning dialog:', error);
        this.handleSessionTimeout();
      }
    });
  }

  /**
   * Extend the current session
   */
  extendSession(): void {
    console.log('🔄 Extending session');
    
    // Reset idle timer
    this.idle.watch();
    
    // Reset dialog state
    this._warningDialogShown.set(false);
    
    // Update state
    this._sessionState.update(state => ({ 
      ...state, 
      isIdle: false,
      isWarning: false,
      lastActivity: Date.now(),
      timeUntilTimeout: 0
    }));
  }

  /**
   * Handle session timeout
   */
  private handleSessionTimeout(): void {
    console.log('🚨 Handling session timeout');
    
    // Stop monitoring
    this.idle.stop();
    
    // Logout user
    this.authService.logout();
    
    // Navigate to session timeout page
    this.router.navigate(['/session-timeout']);
  }

  /**
   * Stop session monitoring
   */
  stopMonitoring(): void {
    console.log('🛑 Stopping session monitoring');
    this.idle.stop();
    
    // Reset dialog state
    this._warningDialogShown.set(false);
    
    this._sessionState.update(state => ({
      ...state,
      isIdle: false,
      isWarning: false,
      isTimedOut: false
    }));
  }

  /**
   * Get current idle time
   */
  getIdleTime(): number {
    return this.idle.getIdle();
  }

  /**
   * Get current timeout time
   */
  getTimeout(): number {
    return this.idle.getTimeout();
  }

  /**
   * Check if user is idle
   */
  isIdle(): boolean {
    return this.idle.isIdling();
  }

  /**
   * Setup reactive effects
   */
  private setupEffects(): void {
    // Effect to log state changes
    effect(() => {
      //const state = this.sessionState();
      //console.log('📊 Session state changed:', {
      //  isIdle: state.isIdle,
      //  isWarning: state.isWarning,
      //  isTimedOut: state.isTimedOut,
      //  timeUntilTimeout: state.timeUntilTimeout
      //});
    }, { allowSignalWrites: true });

    // Effect to handle authentication state changes
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      const isGuest = this.authService.isGuest();
      const initTrigger = this._initTrigger(); // Read trigger to make effect reactive
      
      console.log('🔍 SessionService: Auth state check', { isAuthenticated, initTrigger });
      
      if (!isAuthenticated) {
        console.log('🚫 SessionService: User is not authenticated. Stopping session monitoring');
        this.stopMonitoring();
        return;
      }

      if (isGuest) {
        console.log('🚫 SessionService: User is guest. Stopping session monitoring');
        this.stopMonitoring();
        return;
      }

      // User is authenticated, get config and start monitoring
      const config = this.authService.activityConfig();
      if (!config) {
        console.log('⚠️ SessionService: No config available for authenticated user. Stopping session monitoring');
        this.stopMonitoring();
        return;
      }

      console.log('✅ SessionService: Initializing session with config');
      this.initializeSession({
        idleTime: config.inactivityWarningSeconds,
        timeout: config.warningCountdownSeconds,
        ping: 30, // 30 seconds
        warningTime: 60 // Show warning 60 seconds before timeout
      });
    }, { allowSignalWrites: true });
  }

  /**
   * Manual activity trigger (for testing)
   */
  triggerActivity(): void {
    console.log('🎯 Manually triggering activity');
    this.idle.watch();
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      idleTime: this.getIdleTime(),
      timeout: this.getTimeout(),
      isIdle: this.isIdle(),
      state: this.sessionState()
    };
  }
} 