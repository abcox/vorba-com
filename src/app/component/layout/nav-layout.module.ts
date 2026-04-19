import { Routes } from '@angular/router';
import { NavLayoutPageComponent } from './nav-layout-page.component';
import { AboutPageComponent } from '../page/about-page/about-page.component';
import { ContactPageComponent } from '../page/contact-page/contact-page.component';
import { ResumeComponent } from '../../resume/resume.component';
import { MeetingInviteComponent } from '../meeting-invite/meeting-invite.component';
import { ThankyouPageComponent } from '../page/thankyou-page/thankyou-page.component';
import { HomePageComponent } from '../page/home-page/home-page.component';
import { TeamPageComponent } from '../page/team-page/team-page.component';
import { CaseStudyPageComponent } from '../page/case-study-page/case-study-page.component';
import { ServicePageComponent } from '../page/service-page/service-page.component';
import { PaymentPageComponent } from '../page/payment-page';
import { InvoicePageComponent } from '../page/invoice-page';
import { InvoiceListViewComponent } from '../page/invoice-page/_component/invoice-list-view/invoice-list-view.component';
import { InvoiceDetailComponent } from '../page/invoice-page/_component/invoice-detail';
import { GooglePageComponent } from '../page/google-page/google-page.component';
import { OfferPageComponent } from '../page/offer-page/offer-page.component';
import { quizRoutes } from '../page/quiz-page/quiz.module';

export const DEFAULT_ENTRY = 'home';

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
      { path: 'study', component: CaseStudyPageComponent },
      { path: 'about/team', component: TeamPageComponent },
      { path: 'services', component: ServicePageComponent },
      { path: 'offers', component: OfferPageComponent },
      { path: 'payment', component: PaymentPageComponent },
      { path: 'invoice/new', component: InvoicePageComponent },
      { path: 'invoice/list', component: InvoiceListViewComponent },
      { path: 'invoice/:id/detail', component: InvoiceDetailComponent },
      { path: 'google/sandbox', component: GooglePageComponent },
      { path: 'quiz', children: quizRoutes },
      { path: '', pathMatch: 'full', redirectTo: DEFAULT_ENTRY }
    ]
  }
];
