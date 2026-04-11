import { Routes } from '@angular/router';
import { ContactDetailComponent } from '@src/module/admin/_module/contact-admin/_component/contact-detail/contact-detail.component';
import { ContactFormComponent } from '@src/module/admin/_module/contact-admin/_component/contact-form/contact-form.component';
import { ContactListComponent } from '@src/module/admin/_module/contact-admin/_component/contact-list/contact-list.component';

export const contactAdminRoutes: Routes = [
  {
    path: '',
    component: ContactListComponent,
    title: 'Contact Admin'
  },
  {
    path: 'new',
    component: ContactFormComponent,
    title: 'New Contact'
  },
  {
    path: ':id/edit',
    component: ContactFormComponent,
    title: 'Edit Contact'
  },
  {
    path: ':id',
    component: ContactDetailComponent,
    title: 'Contact Detail'
  }
];
