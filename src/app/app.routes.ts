import { Route, Routes } from '@angular/router';
import { navRoutes } from './component/layout/nav-layout.module';
import { QuizStartPageComponent } from './component/page/quiz-page/quiz-start-page/quiz-start-page.component';
import { QuizPageComponent } from './component/page/quiz-page/quiz-page.component';

export interface MenuItem extends Route {
    title?: string;
    href?: string;
    opened?: boolean;
    visible?: boolean;
}

export const menuItems: MenuItem[] = [
    {
        href: '#',
        opened: false,
        path: 'meeting/invite',
        title: 'Meeting Request',
        visible: true,
    },
    {
      href: '#',
      opened: false,
      path: 'thanks',
      title: 'Thank You!',
      visible: false,
    }
];

export const routes: Routes = [
    ...navRoutes,
    // Quiz routes (nav-less experience)
    {
        path: 'quiz',
        component: QuizStartPageComponent
    },
    {
        path: 'quiz/:id',
        component: QuizPageComponent
    },
    // Catch all - redirect to nav layout
    {
        path: '**',
        redirectTo: '/about',
        pathMatch: 'full'
    }
];
