import { Component } from '@angular/core';
import { MenuToggleComponent } from './_component/menu-toggle/menu-toggle.component';
import { LogoComponent } from './_component/logo/logo.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenuToggleComponent, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {

}
