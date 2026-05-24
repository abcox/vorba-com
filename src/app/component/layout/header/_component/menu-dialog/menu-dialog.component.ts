import { Component, inject, TemplateRef, ViewChild, AfterViewInit, input, computed } from '@angular/core';
import { MenuItem, MenuListComponent } from '../menu-list/menu-list.component';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../../../service/menu/menu.service';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../../../_service/layout.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@src/app/core/auth/auth.service';
import { ThemeService, ThemeSwatch } from '@src/app/services/theme.service';
import { DeviceService } from '@src/app/services/device.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltip, MatTooltipModule } from "@angular/material/tooltip";
import { FontPreset, FontService } from '@src/app/services/font.service';

@Component({
  selector: 'app-menu-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuListComponent, MatIconModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatTooltip
  ],
  templateUrl: './menu-dialog.component.html',
  styleUrl: './menu-dialog.component.scss'
})
export class MenuDialogComponent implements AfterViewInit {
  menuList = input<MenuItem[]>([]);
  fontService = inject(FontService);
  themeService = inject(ThemeService);

  private deviceService = inject(DeviceService);  
  isMobile = this.deviceService.isMobile;

  private menuService = inject(MenuService);
  private layoutService = inject(LayoutService);
  private authService = inject(AuthService);

  menuOpen = this.menuService.menuOpen;
  @ViewChild('themeTemplate') themeTemplate!: TemplateRef<unknown>;  
  menuItems: MenuItem[] = [];
  fontOptions = this.fontService.fontOptions;
  swatchOptions = this.themeService.colorOptions;

  ngAfterViewInit() {
    this.menuItems = this.getMenuItems();
  }

  menuListForDisplay = computed(() => {
    const menuItems = this.getMenuItems();
  
    /* if (this.isMobile()) {
      // splice in the menuList items before the theme item
      const themeItemIndex = menuItems.findIndex(item => item.template === this.themeTemplate);
      menuItems.splice(themeItemIndex, 0, ...this.menuList());
    } */
   if (this.isMobile()) {
    // add menuList items to start of the list, and then a divider
    menuItems.unshift(
      ...this.menuList(),
      { type: 'divider' } as MenuItem
    );
   }
    return menuItems;
  });

  getMenuItems(): MenuItem[] {
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
          setSwatch: (swatch: string) => this.layoutService.setSwatch(swatch as ThemeSwatch),
          swatchTooltip: 'Change theme color (Alt + C + < / Alt + C + >)',
          fontSignal: this.fontService.font,
          fontOptions: this.fontOptions,
          setFont: (font: string) => this.fontService.setFont(font as FontPreset),
          fontTooltip: 'Change font (Alt + B + < / Alt + B + >)'
        }
      }
    ] as MenuItem[];
  }

  closeMenu() {
    this.menuService.closeMenu();
  }
}
