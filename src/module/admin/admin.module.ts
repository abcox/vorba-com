import { Routes } from "@angular/router";
import { QuizAdminPageComponent } from "@src/app/component/page/quiz-page/quiz-admin-page/quiz-admin-page.component";
import { QuizEditPageComponent } from "@src/app/component/page/quiz-page/quiz-admin-page/_component/quiz-edit-page/quiz-edit-page.component";
import { UserAdminPageComponent } from "./user/user-admin-page.component";
import { UserEditComponent } from "./user/_component/edit/user-edit.component";
import { UserCreateComponent } from "./user/_component/create/user-create.component";
import { contactAdminRoutes } from "./_module/contact-admin/contact-admin.module";

// Admin Routes for standalone components
export const adminRoutes: Routes = [
    {
        path: '',
        redirectTo: 'user',
        pathMatch: 'full'
    },
    {
        path: 'contact',
        children: contactAdminRoutes
    },
    {
        path: 'user',
        component: UserAdminPageComponent,
        title: 'User Admin'
    },
    {
        path: 'user/edit/:id',
        component: UserEditComponent,
        title: 'User Edit'
    },
    {
        path: 'user/new',
        component: UserCreateComponent,
        title: 'User Create'
    },
    {
        path: 'quiz',
        component: QuizAdminPageComponent,
        title: 'Quiz Admin'
    },
    {
        path: 'quiz/edit/:id',
        component: QuizEditPageComponent,
        title: 'Quiz Edit'
    }
];