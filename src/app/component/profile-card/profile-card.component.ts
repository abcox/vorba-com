import { Component } from '@angular/core';
import { SocialMediaLinksComponent } from '../layout/_component/social-media-links/social-media-links.component';
import { AvatarComponent } from './_component/avatar/avatar.component';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [SocialMediaLinksComponent, AvatarComponent],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent {

}
