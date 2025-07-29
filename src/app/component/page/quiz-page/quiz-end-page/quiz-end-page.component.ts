import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-quiz-end-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './quiz-end-page.component.html',
  styleUrl: './quiz-end-page.component.scss'
})
export class QuizEndPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // Get quiz data from route params or service
  quizId: string | null = null;
  quizTitle: string = '';
  totalQuestions: number = 0;
  answeredQuestions: number = 0;
  
  ngOnInit() {
    // Get quiz data from route params and query params
    this.route.params.subscribe(params => {
      this.quizId = params['id'];
    });
    
    this.route.queryParams.subscribe(queryParams => {
      this.quizTitle = queryParams['quizTitle'] || 'Quiz';
      this.totalQuestions = parseInt(queryParams['totalQuestions']) || 0;
      this.answeredQuestions = parseInt(queryParams['answeredQuestions']) || 0;
    });
  }
  
  goToHome() {
    this.router.navigate(['/']);
  }
  
  goToQuizStart() {
    this.router.navigate(['/quiz']);
  }
  
  getCompletionPercentage(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.answeredQuestions / this.totalQuestions) * 100);
  }
} 