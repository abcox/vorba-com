import { Routes } from '@angular/router';
import { ResumeComponent } from './resume/resume.component';
import { HomeComponent } from './component/page/home/home.component';
import { AboutPageComponent } from './component/page/about-page/about-page.component';
import { ContactPageComponent } from './component/page/contact-page/contact-page.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },    
    {
        path: 'home',
        redirectTo: '/',
        pathMatch: 'full'
    },
    {
        path: 'about',
        component: AboutPageComponent
    },
    {
        path: 'contact',
        component: ContactPageComponent
    },
    {
        path: 'resume',
        component: ResumeComponent
    },
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full'
    }
];
