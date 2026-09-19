import { Routes } from '@angular/router';
import { adminGuard, authGuard } from '@src/app/core/auth/auth.guard';
import { FileUploadPageComponent } from '@src/app/component/page/file-upload-page/file-upload-page.component';
import { QuizAdminPageComponent } from './feature/quiz-admin-page/quiz-admin-page.component';
import { QuizEditPageComponent } from './feature/quiz-admin-page/_component/quiz-edit-page/quiz-edit-page.component';
import { QuizEndPageComponent } from './feature/quiz-end-page/quiz-end-page.component';
import { QuizPageComponent } from './feature/quiz-page.component';
import { QuizStartPageComponent } from './feature/quiz-start-page/quiz-start-page.component';

export const surveyRoutes: Routes = [
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
    canActivate: [authGuard({ redirectTo: '/quiz/start' })]
  },
  {
    path: ':id/report',
    loadComponent: () => import('@src/app/component/page/file-upload-page/_component/file-report-page/file-report-page.component')
      .then((m) => m.FileReportPageComponent),
    title: 'File report',
    canActivate: [authGuard({ redirectTo: '/quiz/start' })]
  },
  {
    path: ':id',
    component: QuizPageComponent,
    title: 'Quiz Questions',
    canActivate: [authGuard({ redirectTo: '/quiz/start' })]
  },
  {
    path: ':id/end',
    component: QuizEndPageComponent,
    title: 'Quiz Complete'
  }
];

export const surveyAdminRoutes: Routes = [
  {
    path: '',
    component: QuizAdminPageComponent,
    title: 'Quiz Admin',
    canActivate: [adminGuard()]
  },
  {
    path: 'edit/:id',
    component: QuizEditPageComponent,
    title: 'Quiz Edit',
    canActivate: [adminGuard()]
  },
  {
    path: 'new',
    component: QuizEditPageComponent,
    title: 'Quiz Create',
    canActivate: [adminGuard()]
  }
];