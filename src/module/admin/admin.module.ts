import { Routes } from "@angular/router";
import { QuizAdminPageComponent } from "src/app/component/page/quiz-page/quiz-admin-page/quiz-admin-page.component";
import { UserAdminPageComponent } from "./user/user-admin-page.component";

// Admin Routes for standalone components
export const adminRoutes: Routes = [
    {
        path: '',
        redirectTo: 'user',
        pathMatch: 'full'
    },
    {
        path: 'user',
        component: UserAdminPageComponent,
        title: 'User Admin'
    },
    {
        path: 'quiz',
        component: QuizAdminPageComponent,
        title: 'Quiz Admin'
    }
];