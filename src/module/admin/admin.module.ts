import { Routes } from "@angular/router";
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
        loadChildren: () => import('@src/module/survey/survey.module').then((m) => m.surveyAdminRoutes)
    }
];