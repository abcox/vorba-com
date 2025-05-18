import { Component, inject } from '@angular/core';
import { ProfileCardComponent } from '../../profile-card/profile-card.component';
import { LayoutService } from '../../layout/_service/layout.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [ProfileCardComponent],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent {
  layoutService = inject(LayoutService);

  ngOnInit() {
    this.layoutService.setTitlePrefix('About');
  }
}
