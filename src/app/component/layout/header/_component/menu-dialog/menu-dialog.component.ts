import { Component, inject, TemplateRef, ViewChild, viewChild, OnInit, AfterViewInit } from '@angular/core';
import { MenuItem, MenuListComponent } from '../menu-list/menu-list.component';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../../../service/menu/menu.service';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../../../_service/layout.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuListComponent, MatIconModule, MatSlideToggleModule],
  templateUrl: './menu-dialog.component.html',
  styleUrl: './menu-dialog.component.scss'
})
export class MenuDialogComponent implements AfterViewInit {
  private menuService = inject(MenuService);
  private layoutService = inject(LayoutService);
  menuOpen = this.menuService.menuOpen;
  @ViewChild('themeTemplate') themeTemplate!: TemplateRef<any>;  
  menuItems: MenuItem[] = [];

  ngAfterViewInit() {
    this.menuItems = this.getMenuItems();
  }

  getMenuItems(): MenuItem[] {
    // TODO: use menu items from the config file
    return [
      /* {
        label: 'Home',
        routerLink: '/',
        icon: 'home'
      }, */
      {
        label: 'About',
        routerLink: '/about',
        icon: 'info'
      },
      {
        label: 'Contact',
        routerLink: '/contact',
        icon: 'group'
      },
      {
        label: 'Sign-in',
        routerLink: '/admin/user',
        icon: 'login'
      },
      {
        type: 'divider'
      },
      {
        label: 'Theme',
        template: this.themeTemplate,
        templateContext: {
          isLightThemeSignal: this.layoutService.isLightTheme,
          toggleTheme: () => this.layoutService.toggleTheme()
        }
      }
    ];
  }

  closeMenu() {
    this.menuService.closeMenu();
  }
}
