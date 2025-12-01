import { Component } from '@angular/core';
import { SocialMediaLinksComponent } from '../_component/social-media-links/social-media-links.component';
import { CommonModule } from '@angular/common';
import { ServiceSectionComponent } from './_component/service-section/service-section.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, ServiceSectionComponent, SocialMediaLinksComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
