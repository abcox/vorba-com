import { Component, inject } from '@angular/core';
import { MenuItem, MenuListComponent } from '../menu-list/menu-list.component';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../../../service/menu/menu.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-menu-dialog',
  standalone: true,
  imports: [CommonModule, MenuListComponent, MatIconModule],
  templateUrl: './menu-dialog.component.html',
  styleUrl: './menu-dialog.component.scss'
})
export class MenuDialogComponent {
  private menuService = inject(MenuService);
  menuOpen = this.menuService.menuOpen;
  menuItems: MenuItem[] = [
    {
      label: 'Home',
      routerLink: '/',
      icon: 'home'
    },
    {
      label: 'About',
      routerLink: '/about',
      icon: 'info'
    },
    {
      label: 'Contact',
      routerLink: '/contact',
      icon: 'contact'
    }
  ];
  
  closeMenu() {
    this.menuService.closeMenu();
  }
}
