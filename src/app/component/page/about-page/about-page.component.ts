import { Component, inject } from '@angular/core';
import { ProfileCardComponent } from '../../profile-card/profile-card.component';
import { LayoutService } from '../../layout/_service/layout.service';
import { AvatarComponent } from '../../profile-card/_component/avatar/avatar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterModule, ProfileCardComponent, AvatarComponent],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent {
  layoutService = inject(LayoutService);

  ngOnInit() {
    this.layoutService.setTitlePrefix('About');
  }
}
