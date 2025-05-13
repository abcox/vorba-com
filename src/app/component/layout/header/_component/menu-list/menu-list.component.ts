import { Component, input, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuService } from '../../../../../service/menu/menu.service';

export interface MenuItem {
  label: string;
  routerLink: string;
  icon?: string;
  subItems?: MenuItem[];
}

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent {
  menuItems = input<MenuItem[]>([]);
  private router = inject(Router);
  private menuService = inject(MenuService);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.menuService.closeMenu();
    });
  }
}
