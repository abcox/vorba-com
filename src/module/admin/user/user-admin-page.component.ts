import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterModule } from '@angular/router';
import { UserService, UserDto } from '@file-service-api/v1';
import { MatExpansionModule } from '@angular/material/expansion';
import { Theme, ThemeService } from 'src/app/services/theme.service';
import { ConfirmDialogService } from 'src/app/component/dialog/confirm-dialog';

@Component({
  selector: 'app-user-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSlideToggleModule,
    RouterModule
  ],
  templateUrl: './user-admin-page.component.html',
  styleUrl: './user-admin-page.component.scss'
})
export class UserAdminPageComponent implements OnInit {
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);
  
  // user management
  private userService = inject(UserService);
  userList: UserDto[] = [];
  displayedUserColumns: string[] = [/* 'username',  */'email', 'name', 'isActive', 'isAdmin', 'roles', 'lastLoginAt', 'actions'];
  
  ngOnInit() {
    this.themeService.setTheme(Theme.Dark);

    // user management
    this.loadUserList();
  }
    
  goToHome() {
    this.router.navigate(['/']);
  }

  get userDataSource(): MatTableDataSource<UserDto> {
    return new MatTableDataSource(this.userList);
  }

  loadUserList() {
    this.userService.userControllerGetUserList().subscribe({
      next: (response) => {
        console.log('User list loaded:', response);
        /* if (response.success && response.data) {
          this.userList = response.data;
        } */
       this.userList = response;
      },
      error: (error) => {
        console.error('Error loading user list:', error);
      }
    });
  }

  // User management methods
  createNewUser() {
    // TODO: Implement user creation
    console.log('Create new user');
    this.router.navigate(['/admin/user/new']);
  }

  editUser(userId: string) {
    // TODO: Navigate to user edit page
    console.log('Edit user:', userId);
    this.router.navigate(['/admin/user/edit', userId]);
  }

  deleteUser(userId: string) {
    // Find the user to get their name for the confirmation dialog
    const user = this.userList.find(u => u.id === userId);
    const userName = user?.name || user?.username || 'this user';
    
    this.confirmDialog.confirmDelete(userName).subscribe(confirmed => {
      if (confirmed) {
        this.userService.userControllerDeleteUser(userId).subscribe({
          next: (response) => {
            console.log('User deleted:', response);
            this.loadUserList();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
          }
        });
      }
    });
  }

  toggleUserStatus(user: UserDto) {
    if (user.isActive) {
      this.deactivateUser(user.id);
    } else {
      this.activateUser(user.id);
    }
  }

  activateUser(userId: string) {
    this.userService.userControllerActivateUser(userId).subscribe({
      next: (response) => {
        console.log('User activated:', response);
        this.loadUserList();
      },
      error: (error) => {
        console.error('Error activating user:', error);
      }
    });
  }

  deactivateUser(userId: string) {
    this.userService.userControllerDeactivateUser(userId).subscribe({
      next: (response) => {
        console.log('User deactivated:', response);
        this.loadUserList();
      },
      error: (error) => {
        console.error('Error deactivating user:', error);
      }
    });
  }
}
