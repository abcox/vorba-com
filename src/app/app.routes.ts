import { Route, Routes } from '@angular/router';
import { DEFAULT_ENTRY, navRoutes } from './component/layout/nav-layout.module';
import { adminRoutes } from '@src/module/admin/admin.module';
import { adminGuard } from './core/auth/auth.guard';
import { AdminLayoutPageComponent } from '@src/module/admin/_component/layout/admin-layout-page.component';
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
    {
        path: '',
        pathMatch: 'full',
        redirectTo: DEFAULT_ENTRY
    },
    ...navRoutes,
    {
        path: 'admin',
        component: AdminLayoutPageComponent,
        children: adminRoutes,
        canActivate: [adminGuard()]
    },
    {
        path: 'session-timeout',
        component: SessionTimeoutPageComponent
    },
    {
        path: '**',
        redirectTo: DEFAULT_ENTRY,
        pathMatch: 'full'
    }
];
