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
import { Router } from '@angular/router';
import { QuizService, QuizSummaryDto, UserService, UserDto } from '@file-service-api/v1';
import { Theme, ThemeService } from '../../../../services/theme.service';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-quiz-admin-page',
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
    MatTooltipModule
  ],
  templateUrl: './quiz-admin-page.component.html',
  styleUrl: './quiz-admin-page.component.scss'
})
export class QuizAdminPageComponent implements OnInit {
  private themeService = inject(ThemeService);
  private router = inject(Router);
  
  // quiz management
  private quizService = inject(QuizService);
  quizList: QuizSummaryDto[] = [];
  displayedColumns: string[] = ['title', 'questionCount', 'createdAt', 'actions'];

  // user management
  private userService = inject(UserService);
  userList: UserDto[] = [];
  displayedUserColumns: string[] = ['username', 'email', 'name', 'isActive', 'isAdmin', 'roles', 'lastLoginAt', 'actions'];
  
  ngOnInit() {
    this.themeService.setTheme(Theme.Dark);

    // quiz management
    this.loadQuizList();

    // user management
    this.loadUserList();
  }
    
  goToHome() {
    this.router.navigate(['/']);
  }

  //#region Quiz Management
  loadQuizList() {
    this.quizService.quizControllerGetQuizList().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.quizList = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading quiz list:', error);
      }
    });
  }

  createNewQuiz() {
    // TODO: Implement quiz creation
    console.log('Create new quiz');
  }
  
  editQuiz(quizId: string) {
    // TODO: Navigate to quiz edit page
    console.log('Edit quiz:', quizId);
  }
  
  deleteQuiz(quizId: string) {
    // TODO: Implement quiz deletion with confirmation
    console.log('Delete quiz:', quizId);
  }
  
  generateSeedData() {
    this.quizService.quizControllerGenerateSeed().subscribe({
      next: (response) => {
        console.log('Seed data generated:', response);
        this.loadQuizList(); // Reload the list
      },
      error: (error) => {
        console.error('Error generating seed data:', error);
      }
    });
  }
//#endregion Quiz Management

//#region User Management
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
  }

  editUser(userId: string) {
    // TODO: Navigate to user edit page
    console.log('Edit user:', userId);
  }

  deleteUser(userId: string) {
    // TODO: Implement user deletion with confirmation
    console.log('Delete user:', userId);
  }

  toggleUserStatus(user: UserDto) {
    // TODO: Implement user status toggle
    console.log('Toggle user status:', user.id, user.isActive);
  }
//#endregion User Management
}
