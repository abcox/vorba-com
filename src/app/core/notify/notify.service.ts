import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

export interface NotifyOptions {
  duration?: number;
  action?: string;
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
  panelClass?: string | string[];
  data?: any;
}

export interface NotifyResult {
  dismissedByAction: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  private snackBar = inject(MatSnackBar);

  // Default configuration
  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    panelClass: 'notify-snackbar'
  };

  /**
   * Show a success notification
   */
  success(
    message: string, 
    options: NotifyOptions = {}
  ): MatSnackBarRef<any> {
    const config = this.buildConfig({
      ...options,
      panelClass: ['notify-snackbar', 'notify-success', ...(options.panelClass ? (Array.isArray(options.panelClass) ? options.panelClass : [options.panelClass]) : [])]
    });

    return this.snackBar.open(message, options.action, config);
  }

  /**
   * Show an error notification
   */
  error(
    message: string, 
    options: NotifyOptions = {}
  ): MatSnackBarRef<any> {
    console.error('Error notification:', message);
    const config = this.buildConfig({
      ...options,
      duration: options.duration || 6000, // Longer duration for errors
      panelClass: ['notify-snackbar', 'notify-error', ...(options.panelClass ? (Array.isArray(options.panelClass) ? options.panelClass : [options.panelClass]) : [])]
    });

    return this.snackBar.open(message, options.action, config);
  }

  /**
   * Show a warning notification
   */
  warning(
    message: string, 
    options: NotifyOptions = {}
  ): MatSnackBarRef<any> {
    const config = this.buildConfig({
      ...options,
      duration: options.duration || 5000,
      panelClass: ['notify-snackbar', 'notify-warning', ...(options.panelClass ? (Array.isArray(options.panelClass) ? options.panelClass : [options.panelClass]) : [])]
    });

    return this.snackBar.open(message, options.action, config);
  }

  /**
   * Show an info notification
   */
  info(
    message: string, 
    options: NotifyOptions = {}
  ): MatSnackBarRef<any> {
    const config = this.buildConfig({
      ...options,
      panelClass: ['notify-snackbar', 'notify-info', ...(options.panelClass ? (Array.isArray(options.panelClass) ? options.panelClass : [options.panelClass]) : [])]
    });

    return this.snackBar.open(message, options.action, config);
  }

  /**
   * Show a notification with custom configuration
   */
  show(
    message: string, 
    action?: string, 
    options: NotifyOptions = {}
  ): MatSnackBarRef<any> {
    const config = this.buildConfig(options);
    return this.snackBar.open(message, action, config);
  }

  /**
   * Show a persistent notification (no auto-dismiss)
   */
  persistent(
    message: string, 
    action: string = 'Dismiss',
    options: NotifyOptions = {}
  ): MatSnackBarRef<any> {
    const config = this.buildConfig({
      ...options,
      duration: 0 // No auto-dismiss
    });

    return this.snackBar.open(message, action, config);
  }

  /**
   * Show a notification with action that returns an observable
   */
  withAction(
    message: string, 
    action: string,
    options: NotifyOptions = {}
  ): Observable<NotifyResult> {
    const snackBarRef = this.show(message, action, options);
    
    return new Observable(observer => {
      const actionSubscription = snackBarRef.onAction().subscribe(() => {
        observer.next({ dismissedByAction: true });
        observer.complete();
      });

      const dismissedSubscription = snackBarRef.afterDismissed().subscribe(() => {
        observer.next({ dismissedByAction: false });
        observer.complete();
      });

      return () => {
        actionSubscription.unsubscribe();
        dismissedSubscription.unsubscribe();
      };
    });
  }

  /**
   * Dismiss all open notifications
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }

  /**
   * Build MatSnackBarConfig from options
   */
  private buildConfig(options: NotifyOptions): MatSnackBarConfig {
    return {
      ...this.defaultConfig,
      duration: options.duration !== undefined ? options.duration : this.defaultConfig.duration,
      horizontalPosition: options.horizontalPosition || this.defaultConfig.horizontalPosition,
      verticalPosition: options.verticalPosition || this.defaultConfig.verticalPosition,
      panelClass: options.panelClass || this.defaultConfig.panelClass,
      data: options.data
    };
  }

  /**
   * Quick success notifications for common actions
   */
  saved(): MatSnackBarRef<any> {
    return this.success('Changes saved successfully', { action: 'Undo' });
  }

  deleted(): MatSnackBarRef<any> {
    return this.success('Item deleted successfully');
  }

  created(): MatSnackBarRef<any> {
    return this.success('Item created successfully');
  }

  updated(): MatSnackBarRef<any> {
    return this.success('Item updated successfully');
  }

  copied(): MatSnackBarRef<any> {
    return this.success('Copied to clipboard');
  }

  /**
   * Quick error notifications for common errors
   */
  networkError(): MatSnackBarRef<any> {
    return this.error('Network error. Please check your connection and try again.');
  }

  serverError(): MatSnackBarRef<any> {
    return this.error('Server error. Please try again later.');
  }

  validationError(message?: string): MatSnackBarRef<any> {
    return this.error(message || 'Please check your input and try again.');
  }

  permissionError(): MatSnackBarRef<any> {
    return this.error('You don\'t have permission to perform this action.');
  }
} 