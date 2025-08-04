import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { UserService, UserDto } from '@file-service-api/v1';
import { Theme, ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateComponent implements OnInit {
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  
  userForm!: FormGroup;
  creating = false;

  ngOnInit() {
    this.themeService.setTheme(Theme.Dark);
    this.initForm();
  }

  private initForm() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['', [Validators.required]],
      roles: [['user']]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.creating = true;
      const createData = this.userForm.value;

      this.userService.userControllerCreateUser(createData).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.creating = false;
          this.router.navigate(['/admin/user']);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.creating = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/admin/user']);
  }

  addRole(role: string) {
    const currentRoles = this.userForm.get('roles')?.value || [];
    if (!currentRoles.includes(role)) {
      this.userForm.patchValue({ roles: [...currentRoles, role] });
    }
  }

  removeRole(role: string) {
    const currentRoles = this.userForm.get('roles')?.value || [];
    this.userForm.patchValue({ 
      roles: currentRoles.filter((r: string) => r !== role) 
    });
  }

  get availableRoles(): string[] {
    return ['admin', 'user', 'moderator', 'auditor', 'developer', 'supervisor'];
  }

  get passwordStrength(): string {
    const password = this.userForm.get('password')?.value || '';
    if (password.length === 0) return '';
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    return 'strong';
  }

  get passwordStrengthColor(): string {
    const strength = this.passwordStrength;
    switch (strength) {
      case 'weak': return 'warn';
      case 'medium': return 'accent';
      case 'strong': return 'primary';
      default: return '';
    }
  }
} 