import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '@src/app/component/profile-card/_component/avatar/avatar.component';
import { LayoutService } from '@src/app/component/layout/_service/layout.service';

@Component({
  selector: 'app-about-adam-cox-page',
  standalone: true,
  imports: [RouterModule, AvatarComponent],
  templateUrl: './about-adam-cox-page.component.html',
  styleUrls: ['./about-adam-cox-page.component.scss']
})
export class AboutAdamCoxPageComponent implements OnInit {
  layoutService = inject(LayoutService);

  ngOnInit() {
    this.layoutService.setTitlePrefix('About');
  }
}
