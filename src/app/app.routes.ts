import { Route, Routes } from '@angular/router';
import { navRoutes } from './component/layout/nav-layout.module';
import { quizRoutes } from './component/page/quiz-page/quiz.module';

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
    // Quiz routes
    {
        path: 'quiz',
        children: quizRoutes
    },
    // Catch all - redirect to nav layout
    {
        path: '**',
        redirectTo: '/about',
        pathMatch: 'full'
    }
];
