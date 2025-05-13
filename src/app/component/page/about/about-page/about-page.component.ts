import { Component } from '@angular/core';
import { ProfileCardComponent } from '../../_component/profile-card/profile-card.component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [ProfileCardComponent],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent {

}
