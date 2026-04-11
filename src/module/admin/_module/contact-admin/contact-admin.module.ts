import { Routes } from '@angular/router';
import { ContactListComponent } from './_component/contact-list/contact-list.component';

export const contactAdminRoutes: Routes = [
  {
    path: '',
    component: ContactListComponent,
    title: 'Contact Admin'
  }
];
