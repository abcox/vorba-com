import { Component } from '@angular/core';
import { environment } from '@src/environments/environment';

@Component({
  selector: 'app-social-media-links',
  standalone: true,
  imports: [],
  templateUrl: './social-media-links.component.html',
  styleUrls: ['./social-media-links.component.scss']
})
export class SocialMediaLinksComponent {

  data = environment.profiles.find(profile => profile.name === 'Vorba Corporation')!.socialMediaLinks;

}
