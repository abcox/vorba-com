import { Component, inject, TemplateRef, ViewChild, viewChild, OnInit, AfterViewInit } from '@angular/core';
import { MenuItem, MenuListComponent } from '../menu-list/menu-list.component';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../../../service/menu/menu.service';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../../../_service/layout.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@src/app/core/auth/auth.service';
import { ThemeSwatch } from '@src/app/services/theme.service';

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
  private authService = inject(AuthService);
  
  menuOpen = this.menuService.menuOpen;
  @ViewChild('themeTemplate') themeTemplate!: TemplateRef<any>;  
  menuItems: MenuItem[] = [];
  swatchOptions = [
    { value: ThemeSwatch.Default, label: 'System Default' },
    { value: ThemeSwatch.Classic, label: 'Classic Offer' },
    { value: ThemeSwatch.Ocean, label: 'Ocean' },
    { value: ThemeSwatch.Forest, label: 'Forest' },
    { value: ThemeSwatch.Ember, label: 'Ember' }
  ];

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
        label: 'User admin',
        routerLink: '/admin/user',
        icon: 'group'
      },
      {
        label: 'Sign out',
        routerLink: '/logout',
        icon: 'login',
        action: () => this.authService.logout()
      },
      {
        type: 'divider'
      },
      {
        label: 'Theme',
        template: this.themeTemplate,
        templateContext: {
          isLightThemeSignal: this.layoutService.isLightTheme,
          toggleTheme: () => this.layoutService.toggleTheme(),
          swatchSignal: this.layoutService.swatchSignal,
          swatchOptions: this.swatchOptions,
          setSwatch: (swatch: string) => this.layoutService.setSwatch(swatch as ThemeSwatch)
        }
      }
    ];
  }

  closeMenu() {
    this.menuService.closeMenu();
  }
}
