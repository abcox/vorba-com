import { Component } from '@angular/core';
import { ProfileCardComponent } from '../../_component/profile-card/profile-card.component';
@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [ProfileCardComponent],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent {

}
