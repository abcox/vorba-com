import { Component, input, TemplateRef, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

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
  imports: [RouterModule, NgTemplateOutlet],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent implements OnInit {
  menuItems = input<MenuItem[]>([]);

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
