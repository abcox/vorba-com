import { Component, inject } from '@angular/core';
import { LayoutService } from '../../layout/_service/layout.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent {
  layoutService = inject(LayoutService);

  ngOnInit() {
    this.layoutService.setTitlePrefix('Contact');
  }
}
