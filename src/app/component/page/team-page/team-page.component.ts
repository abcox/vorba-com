import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceSectionComponent } from '../../layout/footer/_component/service-section/service-section.component';

interface TeamMember {
  name: string;
  role: string;
  profileImageUrl: string;
  bio: string;
  linkedInUrl?: string;
}

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [CommonModule, ServiceSectionComponent],
  templateUrl: './team-page.component.html',
  styleUrl: './team-page.component.scss'
})
export class TeamPageComponent {
    team = signal([
        {
            name: 'Adam Cox',
            role: 'President & CEO',
            profileImageUrl: '/images/team/AdamCox_400x400.jpg',
            bio: 'Adam is the President & CEO of the company and has over 25 years of experience in the industry.',
            linkedInUrl: 'https://www.linkedin.com/in/adamcox27/',
        },
        {
            name: 'Jeff Banks',
            role: 'Executive Director & CMO',
            profileImageUrl: '/images/team/JBanks.jpg',
            bio: 'Jeff is the Executive Director & CMO and leads our marketing strategy and efforts.',
            linkedInUrl: 'https://www.linkedin.com/in/jeffrey-banks-37252b2b/',
        }
    ])
}