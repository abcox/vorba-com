import { Routes } from '@angular/router';
import { ResumeComponent } from './resume/resume.component';
import { HomePageComponent } from './component/page/home-page/home-page.component';
import { AboutPageComponent } from './component/page/about-page/about-page.component';
import { ContactPageComponent } from './component/page/contact-page/contact-page.component';

export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
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
