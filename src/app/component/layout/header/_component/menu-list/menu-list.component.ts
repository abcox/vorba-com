import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

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
}
