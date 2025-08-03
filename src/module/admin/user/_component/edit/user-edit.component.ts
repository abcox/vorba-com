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
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, UserDto, UpdateUserDto } from '@file-service-api/v1';
import { Theme, ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-user-edit',
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
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent implements OnInit {
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  
  userForm!: FormGroup;
  user: UserDto | null = null;
  loading = false;
  saving = false;
  userId: string = '';

  ngOnInit() {
    this.themeService.setTheme(Theme.Dark);
    this.initForm();
    this.loadUser();
  }

  private initForm() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      name: [''],
      isActive: [true],
      isAdmin: [false],
      roles: [['user']]
    });
  }

  private loadUser() {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.userId) {
      this.router.navigate(['/admin/user']);
      return;
    }

    this.loading = true;

    this.userService.userControllerGetUserById(this.userId).subscribe({
      next: (response: UserDto) => {
        this.user = response;
        this.userForm.patchValue(this.user);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid && this.userId) {
      this.saving = true;
      const updateData: UpdateUserDto = this.userForm.value;

      this.userService.userControllerUpdateUser(this.userId, updateData).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this.saving = false;
          this.router.navigate(['/admin/user']);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.saving = false;
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
}
