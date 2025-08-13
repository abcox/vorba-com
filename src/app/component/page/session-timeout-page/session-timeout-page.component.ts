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
        <div class="session-timeout-content">
          <mat-card class="session-timeout-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="warning-icon">warning</mat-icon>
                Session Expired
              </mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <p class="message">Your session has expired due to inactivity.</p>
              <p class="message">For your security, you have been automatically logged out.</p>
              
              <div class="actions">
                <button mat-raised-button color="primary" (click)="login()" class="login-button">
                  <mat-icon>login</mat-icon>
                  Sign In Again
                </button>
                <button mat-button (click)="goHome()" class="home-button">
                  <mat-icon>home</mat-icon>
                  Return to Home
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    `,
    styles: [`
      .session-timeout-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        box-sizing: border-box;
      }

      .session-timeout-content {
        width: 100%;
        max-width: 500px;
      }

      .session-timeout-card {
        text-align: center;
        padding: 40px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }

      .warning-icon {
        color: #f57c00;
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        margin-right: 12px;
        vertical-align: middle;
      }

      mat-card-title {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 20px;
      }

      .message {
        font-size: 1.1rem;
        color: #666;
        line-height: 1.6;
        margin: 16px 0;
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 32px;
      }

      .login-button {
        padding: 12px 24px;
        font-size: 1.1rem;
        font-weight: 500;
        border-radius: 8px;
        min-height: 48px;
      }

      .home-button {
        padding: 12px 24px;
        font-size: 1rem;
        border-radius: 8px;
        min-height: 48px;
      }

      .login-button mat-icon,
      .home-button mat-icon {
        margin-right: 8px;
      }

      /* Responsive design */
      @media (max-width: 600px) {
        .session-timeout-container {
          padding: 16px;
        }

        .session-timeout-card {
          padding: 32px 16px;
        }

        mat-card-title {
          font-size: 1.5rem;
        }

        .message {
          font-size: 1rem;
        }

        .actions {
          gap: 12px;
        }
      }

      /* Dark theme support */
      @media (prefers-color-scheme: dark) {
        .session-timeout-card {
          background: rgba(30, 30, 30, 0.95);
          color: #fff;
        }

        mat-card-title {
          color: #fff;
        }

        .message {
          color: #ccc;
        }
      }
    `],
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
