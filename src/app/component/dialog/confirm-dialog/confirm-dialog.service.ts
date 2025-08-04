import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialog = inject(MatDialog);

  /**
   * Open a confirmation dialog
   * @param data Dialog configuration
   * @returns Observable that emits true if confirmed, false if cancelled
   */
  open(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> = this.dialog.open(
      ConfirmDialogComponent,
      {
        data,
        width: '400px',
        maxWidth: '90vw',
        disableClose: false,
        autoFocus: false,
        panelClass: 'confirm-dialog-panel'
      }
    );

    return dialogRef.afterClosed().pipe(
      map((result: boolean | undefined) => result ?? false)
    );
  }

  /**
   * Quick method for delete confirmation
   * @param itemName Name of the item being deleted
   * @returns Observable that emits true if confirmed, false if cancelled
   */
  confirmDelete(itemName: string): Observable<boolean> {
    return this.open({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn',
      icon: 'delete_forever'
    });
  }

  /**
   * Quick method for general confirmation
   * @param title Dialog title
   * @param message Dialog message
   * @param confirmText Text for confirm button
   * @returns Observable that emits true if confirmed, false if cancelled
   */
  confirm(title: string, message: string, confirmText: string = 'Confirm'): Observable<boolean> {
    return this.open({
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      confirmColor: 'primary',
      icon: 'help_outline'
    });
  }

  /**
   * Quick method for warning confirmation
   * @param title Dialog title
   * @param message Dialog message
   * @param confirmText Text for confirm button
   * @returns Observable that emits true if confirmed, false if cancelled
   */
  confirmWarning(title: string, message: string, confirmText: string = 'Proceed'): Observable<boolean> {
    return this.open({
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      confirmColor: 'warn',
      icon: 'warning'
    });
  }

  /**
   * Quick method for success confirmation
   * @param title Dialog title
   * @param message Dialog message
   * @param confirmText Text for confirm button
   * @returns Observable that emits true if confirmed, false if cancelled
   */
  confirmSuccess(title: string, message: string, confirmText: string = 'OK'): Observable<boolean> {
    return this.open({
      title,
      message,
      confirmText,
      showCancel: false,
      confirmColor: 'primary',
      icon: 'check_circle'
    });
  }
} 