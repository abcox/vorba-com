import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { interval, Subscription } from 'rxjs';

export interface ActivityWarningDialogData {
  timeRemaining: number; // seconds
}

export interface ActivityWarningDialogResult {
  success: boolean;
  action: 'extend' | 'logout';
}

@Component({
  selector: 'app-activity-warning',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="activity-warning-dialog">
      <h2 mat-dialog-title>Session Timeout Warning</h2>
      
      <mat-dialog-content>
        <p>You've been inactive for a while and your session will expire in <strong>{{ formatTimeRemaining() }}</strong>.</p>
        <p>Would you like to stay logged in?</p>
        
        <div class="countdown-container" *ngIf="timeRemaining > 0">
          <div class="countdown-bar">
            <div class="countdown-progress" [style.width.%]="countdownPercentage"></div>
          </div>
          <p class="countdown-text">Auto-logout in {{ timeRemaining }} seconds</p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="logout()" color="warn">
          Logout Now
        </button>
        <button mat-raised-button (click)="extendSession()" color="primary">
          Stay Logged In
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .activity-warning-dialog {
      padding: 20px;
      min-width: 400px;
    }
    
    h2 {
      color: #d32f2f;
      margin-bottom: 16px;
    }
    
    mat-dialog-content {
      margin: 16px 0;
    }
    
    .countdown-container {
      margin: 20px 0;
      text-align: center;
    }
    
    .countdown-bar {
      width: 100%;
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    
    .countdown-progress {
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #ff9800, #f44336);
      transition: width 1s linear;
      border-radius: 4px;
    }
    
    .countdown-text {
      font-size: 14px;
      color: #666;
      margin: 0;
      font-weight: 500;
    }
    
    mat-dialog-actions {
      margin-top: 24px;
    }
    
    button {
      margin-left: 8px;
    }
  `]
})
export class ActivityWarningComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<ActivityWarningComponent>);
  private data = inject(MAT_DIALOG_DATA) as ActivityWarningDialogData;
  
  timeRemaining: number = 0;
  initialTime: number = 0;
  countdownPercentage: number = 100;
  private countdownSubscription?: Subscription;

  ngOnInit(): void {
    console.log('⏰ ActivityWarning: Initializing with timeRemaining:', this.data.timeRemaining);
    this.timeRemaining = this.data.timeRemaining;
    this.initialTime = this.timeRemaining;
    console.log('⏰ ActivityWarning: Set timeRemaining:', this.timeRemaining, 'initialTime:', this.initialTime);
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  private startCountdown(): void {
    console.log('⏰ ActivityWarning: Starting countdown from:', this.timeRemaining, 'seconds');
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      
      // Prevent negative values
      if (this.timeRemaining < 0) {
        this.timeRemaining = 0;
      }
      
      this.countdownPercentage = (this.timeRemaining / this.initialTime) * 100;
      
      console.log('⏰ ActivityWarning: Countdown - timeRemaining:', this.timeRemaining, 'percentage:', this.countdownPercentage.toFixed(1) + '%');
      
      if (this.timeRemaining <= 0) {
        console.log('⏰ ActivityWarning: Countdown reached zero, triggering auto-logout');
        this.stopCountdown();
        this.autoLogout();
      }
    });
  }

  private stopCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = undefined;
    }
  }

  private autoLogout(): void {
    console.log('⏰ ActivityWarning: Auto-logout triggered');
    this.dialogRef.close({
      success: false,
      action: 'logout'
    } as ActivityWarningDialogResult);
  }

  formatTimeRemaining(): string {
    // Ensure we don't show negative values
    const timeToShow = Math.max(0, this.timeRemaining);
    const minutes = Math.floor(timeToShow / 60);
    const seconds = timeToShow % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  extendSession(): void {
    this.stopCountdown();
    this.dialogRef.close({
      success: true,
      action: 'extend'
    } as ActivityWarningDialogResult);
  }

  logout(): void {
    this.stopCountdown();
    this.dialogRef.close({
      success: false,
      action: 'logout'
    } as ActivityWarningDialogResult);
  }
} 