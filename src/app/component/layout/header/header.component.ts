import { Component, inject } from '@angular/core';
import { MenuToggleComponent } from './_component/menu-toggle/menu-toggle.component';
import { LogoComponent } from './_component/logo/logo.component';
import { MenuDialogComponent } from './_component/menu-dialog/menu-dialog.component';
import { LayoutService } from '../_service/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenuToggleComponent, LogoComponent, MenuDialogComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  titlePrefix = inject(LayoutService).titlePrefixSignal;
}
