import { Route, Routes } from '@angular/router';
import { ResumeComponent } from './resume/resume.component';
import { AboutPageComponent } from './component/page/about-page/about-page.component';
import { ContactPageComponent } from './component/page/contact-page/contact-page.component';
import { MeetingInviteComponent } from './component/meeting-invite/meeting-invite.component';
//import { requireAuthentication } from './common/guards/auth.guard';
import { ThankyouPageComponent } from './component/page/thankyou-page/thankyou-page.component';
import { QuizStartPageComponent } from './component/page/quiz-page/quiz-start-page/quiz-start-page.component';
import { QuizPageComponent } from './component/page/quiz-page/quiz-page.component';

export interface MenuItem extends Route {
    title?: string;
    //allowGuest?: boolean;
    //requireAuthentication?: boolean;
    href?: string;
    opened?: boolean;
    visible?: boolean;
}

export const menuItems: MenuItem[] = [
    {
        component: MeetingInviteComponent,
        href: '#',
        opened: false,
        path: 'meeting/invite',
        title: 'Meeting Request',
        visible: true,
    },
    {
      component: ThankyouPageComponent,
      href: '#',
      opened: false,
      path: 'thanks',
      title: 'Thank You!',
      visible: false,
    }
]

export const routes: Routes = [
    ...menuItems.map(item => {
      return {
        path: item.path,
        component: item.component
      };
    }),
    // items below exist on route only, and are not included in the menu
    {
        path: '',
        redirectTo: '/about',
        pathMatch: 'full'
    },    
    /* {
        path: 'home',
        redirectTo: '/',
        pathMatch: 'full'
    }, */
    {
        path: 'quiz',
        component: QuizStartPageComponent
    },
    {
        path: 'quiz/:id',
        component: QuizPageComponent
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
        redirectTo: '/about', // TODO: remove this, and revert back to '/' when ready to launch
        pathMatch: 'full'
    },  
];
