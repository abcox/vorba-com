import { Component, input, TemplateRef, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
/* import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
 */
export interface MenuItem {
  label?: string;
  routerLink?: string;
  icon?: string;
  subItems?: MenuItem[];
  type?: 'item' | 'divider';
  template?: TemplateRef<any>;
  templateContext?: Record<string, any>;
}

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [RouterModule, NgTemplateOutlet, MatIconModule, MatButtonModule],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent implements OnInit {
  menuItems = input<MenuItem[]>([]);
  router = inject(Router);

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    /* console.log('Menu Items:', this.menuItems());
    this.menuItems().forEach(item => {
      if (item.template) {
        console.log('Template found:', item.template);
        console.log('Template context:', item.templateContext);
      }
    }); */
  }
}
