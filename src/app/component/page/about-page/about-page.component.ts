import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface TeamMember {
  name: string;
  role: string;
  profileImageUrl: string;
  bio: string;
  linkedInUrl?: string;
}

@Component({
  selector: 'app-about-page',
  standalone: true,
    imports: [CommonModule, RouterModule],
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.scss']
})
export class AboutPageComponent {
    team = signal<TeamMember[]>([
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

    openings = signal([
        {
            id: 'senior-software-engineer',
            title: 'Senior Software Engineer',
            location: 'Remote',
            description: 'We are looking for a Senior Software Engineer to join our team and help us build innovative solutions for our clients.',
            applyUrl: '/careers/openings/senior-software-engineer'
        },
        {
            id: 'product-manager',
            title: 'Product Manager',
            location: 'Remote',
            description: 'We are seeking a Product Manager to lead the development and execution of our product strategy.',
            applyUrl: '/careers/openings/product-manager'
        }
    ])
}