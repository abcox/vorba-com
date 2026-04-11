import { Routes } from '@angular/router';
import { ContactListComponent } from '@src/module/admin/_module/contact-admin/_component/contact-list/contact-list.component';
import { ContactDetailComponent } from '@src/module/admin/_module/contact-admin/_component/contact-detail/contact-detail.component';

export const contactAdminRoutes: Routes = [
  {
    path: '',
    component: ContactListComponent,
    title: 'Contact Admin'
  },
  {
    path: ':id',
    component: ContactDetailComponent,
    title: 'Contact Detail'
  }
];
