import { Route, Routes } from '@angular/router';
import { navRoutes } from './component/layout/nav-layout.module';
import { quizRoutes } from './component/page/quiz-page/quiz.module';
import { adminRoutes } from 'src/module/admin/admin.module';
import { adminGuard } from './core/auth/auth.guard';
import { AdminLayoutPageComponent } from 'src/module/admin/_component/layout/admin-layout-page.component';
import { SessionTimeoutPageComponent } from './component/page/session-timeout-page/session-timeout-page.component';
import { CaseStudyPageComponent } from './component/page/case-study-page/case-study-page.component';
import { HomePageComponent } from './component/page/home-page/home-page.component';
import { TeamPageComponent } from './component/page/team-page/team-page.component';
import { ServicePageComponent } from './component/page/service-page/service-page.component';

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
    // Root route - must come BEFORE navRoutes
    {
        path: '',
        component: HomePageComponent,
        pathMatch: 'full'
    },
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
    {
        path: 'study',
        component: CaseStudyPageComponent
    },
    {
        path: 'about/team',
        component: TeamPageComponent
    },
    {
        path: 'services',
        component: ServicePageComponent
    },
    // Catch all - redirect to nav layout
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full'
    }
];
