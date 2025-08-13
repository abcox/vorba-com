import { Route, Routes } from '@angular/router';
import { navRoutes } from './component/layout/nav-layout.module';
import { quizRoutes } from './component/page/quiz-page/quiz.module';
import { adminRoutes } from 'src/module/admin/admin.module';
import { adminGuard } from './core/auth/auth.guard';
import { AdminLayoutPageComponent } from 'src/module/admin/_component/layout/admin-layout-page.component';
import { SessionTimeoutPageComponent } from './component/page/session-timeout-page/session-timeout-page.component';

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
    // Admin routes
    {
        path: 'admin',
        component: AdminLayoutPageComponent,
        children: adminRoutes,
        canActivate: [adminGuard()]
    },
    // Quiz routes
    {
        path: 'quiz',
        children: quizRoutes
    },
    // Session timeout routes
    {
        path: 'session-timeout',
        component: SessionTimeoutPageComponent
    },
    // Catch all - redirect to nav layout
    {
        path: '**',
        redirectTo: '/about',
        pathMatch: 'full'
    }
];
