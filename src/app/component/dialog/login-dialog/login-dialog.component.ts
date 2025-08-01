import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from '../../../core/auth/auth.service';
import { finalize } from 'rxjs/operators';
import { ErrorStateMatcher } from '@angular/material/core';

export interface LoginDialogData {
  returnUrl?: string;
  message?: string;
  requireAdmin?: boolean;
}

export interface LoginDialogResult {
  success: boolean;
  user?: any;
  returnUrl?: string;
}

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss'
})
export class LoginDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  dialogRef = inject(MatDialogRef<LoginDialogComponent>);
  data: LoginDialogData = inject(MAT_DIALOG_DATA);

  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  matcher = new ErrorStateMatcher();

  ngOnInit() {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe
    };

    this.authService.login(credentials)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (success) => {
          if (success) {
            const result: LoginDialogResult = {
              success: true,
              user: this.authService.user(),
              returnUrl: this.data.returnUrl
            };
            
            this.dialogRef.close(result);
            
            // Navigate to return URL if provided
            if (this.data.returnUrl) {
              this.router.navigate([this.data.returnUrl]);
            }
          } else {
            this.errorMessage = 'Login failed. Please check your credentials.';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  onForgotPassword(): void {
    // TODO: Implement forgot password dialog or navigation
    console.log('Forgot password clicked');
  }

  onRegister(): void {
    // TODO: Implement registration dialog or navigation
    console.log('Register clicked');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 6 characters`;
    }
    return '';
  }
} 