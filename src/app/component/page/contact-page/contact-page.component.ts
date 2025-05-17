import { Component, inject } from '@angular/core';
import { ProfileCardComponent } from '../../profile-card/profile-card.component';
import { LayoutService } from '../../../service/layout/layout.service';
@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [ProfileCardComponent],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent {
  layoutService = inject(LayoutService);

  ngOnInit() {
    this.layoutService.setTitlePrefix('Contact');
  }
}
