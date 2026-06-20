import { Component, inject } from '@angular/core';
import { MenuService } from '../../../../../service/menu/menu.service';

@Component({
  selector: 'app-menu-toggle',
  standalone: true,
  templateUrl: './menu-toggle.component.html',
  styleUrl: './menu-toggle.component.scss'
})
export class MenuToggleComponent {
  menuService = inject(MenuService);
  menuOpen = this.menuService.menuOpen;

  toggleMenu() {
    this.menuService.toggleMenu();
  }
}
