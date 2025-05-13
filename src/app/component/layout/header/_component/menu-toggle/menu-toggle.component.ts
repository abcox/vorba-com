import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MenuService } from '../../../../../service/menu/menu.service';

@Component({
  selector: 'app-menu-toggle',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './menu-toggle.component.html',
  styleUrl: './menu-toggle.component.scss'
})
export class MenuToggleComponent {
  menuService = inject(MenuService);

  toggleMenu() {
    this.menuService.toggleMenu();
  }
}
