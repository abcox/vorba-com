import { Routes } from '@angular/router';
import { QuizStartPageComponent } from './quiz-start-page/quiz-start-page.component';
import { QuizPageComponent } from './quiz-page.component';
import { QuizEndPageComponent } from './quiz-end-page/quiz-end-page.component';
import { QuizAdminPageComponent } from './quiz-admin-page/quiz-admin-page.component';
import { adminGuard, authGuard } from '../../../core/auth/auth.guard';
import { FileUploadPageComponent } from '../file-upload-page/file-upload-page.component';
import { FileReportPageComponent } from '../file-upload-page/_component/file-report-page/file-report-page.component';

// Quiz Routes for standalone components
export const quizRoutes: Routes = [
  {
    path: '',
    component: QuizStartPageComponent,
    title: 'Start Quiz'
  },
  {
    path: 'start',
    component: QuizStartPageComponent,
    title: 'Start Quiz'
  },
  {
    path: ':id/upload',
    component: FileUploadPageComponent,
    title: 'File upload',
    canActivate: [authGuard({redirectTo: '/quiz/start'})]
  },
  {
    path: ':id/report',
    component: FileReportPageComponent,
    title: 'File report',
    canActivate: [authGuard({redirectTo: '/quiz/start'})]
  },
  // TODO: redirect to /admin/user
  {
    path: 'admin',
    component: QuizAdminPageComponent,
    title: 'Quiz Administration',
    canActivate: [adminGuard()]
  },
  {
    path: ':id',
    component: QuizPageComponent,
    title: 'Quiz Questions',
    canActivate: [authGuard({redirectTo: '/quiz/start'})]
  },
  {
    path: ':id/end',
    component: QuizEndPageComponent,
    title: 'Quiz Complete'
  }
]; 