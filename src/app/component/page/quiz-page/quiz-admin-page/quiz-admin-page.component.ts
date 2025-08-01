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
import { QuizService, QuizSummaryDto } from '@file-service-api/v1';
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
  
  private quizService = inject(QuizService);
  quizList: QuizSummaryDto[] = [];
  displayedColumns: string[] = ['title', 'questionCount', 'createdAt', 'actions'];

  ngOnInit() {
    this.themeService.setTheme(Theme.Dark);

    this.loadQuizList();
  }
    
  goToHome() {
    this.router.navigate(['/']);
  }

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
}
