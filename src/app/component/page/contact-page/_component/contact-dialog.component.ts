import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

export interface ContactDialogData {
  title: string;
  message: string;
  isSuccess: boolean;
  shouldNavigate: boolean;
}

@Component({
  selector: 'app-contact-dialog',
  template: `
    <div class="p-4">
      <h2 mat-dialog-title [class]="data.isSuccess ? 'text-green-600' : 'text-red-600'">
        {{ data.title }}
      </h2>
      <mat-dialog-content class="my-4">
        {{ data.message }}
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class ContactDialogComponent {
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ContactDialogData
  ) {}

  onClose() {
    this.dialogRef.close();
    if (this.data.shouldNavigate) {
      this.router.navigate(['/']);
    }
  }
} 