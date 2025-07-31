import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { LoginDialogComponent, LoginDialogData, LoginDialogResult } from './login-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class LoginDialogService {
  private dialog = inject(MatDialog);

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
      autoFocus: true,
      panelClass: 'login-dialog-panel'
    };

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
} 