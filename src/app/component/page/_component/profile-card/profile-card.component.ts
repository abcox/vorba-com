import { Component } from '@angular/core';
import { SocialMediaLinksComponent } from '../../../layout/_component/social-media-links/social-media-links.component';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [SocialMediaLinksComponent],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent {

}
