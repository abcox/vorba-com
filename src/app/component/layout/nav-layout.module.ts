import { Routes } from '@angular/router';
import { NavLayoutPageComponent } from './nav-layout-page.component';
import { AboutPageComponent } from '../page/about-page/about-page.component';
import { ContactPageComponent } from '../page/contact-page/contact-page.component';
import { ResumeComponent } from '../../resume/resume.component';
import { MeetingInviteComponent } from '../meeting-invite/meeting-invite.component';
import { ThankyouPageComponent } from '../page/thankyou-page/thankyou-page.component';
import { HomePageComponent } from '../page/home-page/home-page.component';

export const navRoutes: Routes = [
  {
    path: '',
    component: NavLayoutPageComponent,
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'about', component: AboutPageComponent },
      { path: 'contact', component: ContactPageComponent },
      { path: 'resume', component: ResumeComponent },
      { path: 'meeting/invite', component: MeetingInviteComponent },
      { path: 'thanks', component: ThankyouPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'about' }
    ]
  }
];
