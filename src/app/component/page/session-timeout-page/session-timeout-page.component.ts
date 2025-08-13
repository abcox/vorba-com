import { Component, inject } from '@angular/core';
import { DialogService } from "../../dialog/dialog.service";
import { Router } from '@angular/router';
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { LoginDialogResult } from '../../dialog/login-dialog/login-dialog.component';

// src/app/component/page/session-timeout-page/session-timeout-page.component.ts
@Component({
    selector: 'app-session-timeout-page',
    template: `
      <div class="session-timeout-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Session Expired</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <p>Your session has expired due to inactivity.</p>
            <p>For your security, you have been automatically logged out.</p>
            
            <div class="actions">
              <button mat-raised-button color="primary" (click)="login()">
                Sign In Again
              </button>
              <button mat-button (click)="goHome()">
                Return to Home
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    `,
    standalone: true,
    imports: [MatCardModule, MatButtonModule, MatIconModule]
  })
  export class SessionTimeoutPageComponent {
    private dialogService = inject(DialogService);
    private router = inject(Router);
  
    login(): void {
      this.dialogService.openGeneralLoginDialog().subscribe((result: LoginDialogResult) => {
        if (result.success) {
          // Redirect to previous page or dashboard
          const returnUrl = result?.returnUrl || '/dashboard';
          this.router.navigate([returnUrl]);
        }
      });
    }
  
    goHome(): void {
      this.router.navigate(['/']);
    }
  }
