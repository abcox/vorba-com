import { Routes } from '@angular/router';
import { QuizStartPageComponent } from './quiz-start-page/quiz-start-page.component';
import { QuizPageComponent } from './quiz-page.component';
import { QuizEndPageComponent } from './quiz-end-page/quiz-end-page.component';
import { QuizAdminPageComponent } from './quiz-admin-page/quiz-admin-page.component';
import { adminGuard } from '../../../core/auth/auth.guard';
import { FileUploadComponent } from './_component/file-upload/file-upload.component';

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
    path: 'file-upload',
    component: FileUploadComponent,
    title: 'File upload'
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
    title: 'Quiz Questions'
  },
  {
    path: ':id/end',
    component: QuizEndPageComponent,
    title: 'Quiz Complete'
  }
]; 