import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { LoginDialogComponent, LoginDialogData, LoginDialogResult } from './login-dialog/login-dialog.component';
import { ActivityWarningComponent, ActivityWarningDialogData, ActivityWarningDialogResult } from './activity-warning/activity-warning.component';
import { LayoutService } from '../layout/_service/layout.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialog = inject(MatDialog);
  private layoutService = inject(LayoutService);

  /**
   * Open login dialog with optional configuration
   */
  openLoginDialog(data?: LoginDialogData): Observable<LoginDialogResult> {
    const config: MatDialogConfig<LoginDialogData> = {
      data: data || {},
      width: '450px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false,
      panelClass: 'login-dialog-panel'
    };

    this.layoutService.closeDrawer();
    const dialogRef = this.dialog.open(LoginDialogComponent, config);
    return dialogRef.afterClosed();
  }

  /**
   * Open login dialog for admin access
   */
  openAdminLoginDialog(returnUrl?: string): Observable<LoginDialogResult> {
    return this.openLoginDialog({
      returnUrl,
      requireAdmin: true,
      message: 'Admin access required. Please sign in with an admin account.'
    });
  }

  /**
   * Open login dialog for general authentication
   */
  openGeneralLoginDialog(returnUrl?: string, message?: string): Observable<LoginDialogResult> {
    return this.openLoginDialog({
      returnUrl,
      message: message || 'Please sign in to continue.'
    });
  }

  /**
   * Open activity warning dialog
   */
  openActivityWarningDialog(timeRemaining: number = 300): Observable<ActivityWarningDialogResult> {
    const config: MatDialogConfig<ActivityWarningDialogData> = {
      data: { timeRemaining },
      width: '450px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      panelClass: 'activity-warning-dialog-panel'
    };

    const dialogRef = this.dialog.open(ActivityWarningComponent, config);
    return dialogRef.afterClosed();
  }

  /**
   * Generic method to open any dialog component
   */
  openDialog<T, R>(
    component: any, 
    data?: T, 
    config?: Partial<MatDialogConfig<T>>
  ): Observable<R> {
    const defaultConfig: MatDialogConfig<T> = {
      data: data,
      width: '450px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      ...config
    };

    const dialogRef = this.dialog.open(component, defaultConfig);
    return dialogRef.afterClosed();
  }
} 