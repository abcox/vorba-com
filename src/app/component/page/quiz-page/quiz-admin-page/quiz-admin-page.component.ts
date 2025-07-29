import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { QuizService, QuizSummaryDto } from '@file-service-api/v1';

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
    MatSnackBarModule
  ],
  templateUrl: './quiz-admin-page.component.html',
  styleUrl: './quiz-admin-page.component.scss'
})
export class QuizAdminPageComponent implements OnInit {
  private router = inject(Router);
  private quizService = inject(QuizService);
  
  quizList: QuizSummaryDto[] = [];
  displayedColumns: string[] = ['title', 'questionCount', 'createdAt', 'actions'];
  
  ngOnInit() {
    this.loadQuizzes();
  }
  
  loadQuizzes() {
    this.quizService.quizControllerGetQuizList().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.quizList = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
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
        this.loadQuizzes(); // Reload the list
      },
      error: (error) => {
        console.error('Error generating seed data:', error);
      }
    });
  }
  
  goToHome() {
    this.router.navigate(['/']);
  }
} 