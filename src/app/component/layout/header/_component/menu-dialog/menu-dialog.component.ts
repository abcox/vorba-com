import { Component, inject, TemplateRef, ViewChild, AfterViewInit, input, computed, signal } from '@angular/core';
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
  @ViewChild('selectTemplate') selectTemplate!: TemplateRef<unknown>;  
  @ViewChild('sliderTemplate') sliderTemplate!: TemplateRef<unknown>;  
  menuItems = signal<MenuItem[]>([]);
  fontOptions = this.fontService.fontOptions;
  swatchOptions = this.themeService.colorOptions;

  ngAfterViewInit() {
    this.menuItems.set(this.getMenuItems());
  }

  menuListForDisplay = computed(() => {
    const menuItems = [...this.menuItems()];

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
        //label: 'Theme',
        template: this.sliderTemplate,
        templateContext: {
          id: 'theme-contrast-toggle',
          stateSignal: this.layoutService.isLightTheme,
          displaySignal: this.layoutService.getThemeContrastForDisplay,
          selectorDelegate: () => this.layoutService.toggleTheme(),
        }
      },
      {
        //label: 'Theme',
        template: this.selectTemplate,
        templateContext: {
          id: 'color-select',
          label: 'Color',
          stateSignal: this.layoutService.swatchSignal,
          stateOptions: this.swatchOptions,
          setState: (value: ThemeSwatch) => this.layoutService.setSwatch(value as ThemeSwatch),
          tooltip: 'Change theme color (Alt + C + < / Alt + C + >)',
        }
      },
      {
        //label: 'Theme',
        template: this.selectTemplate,
        templateContext: {
          id: 'font-select',
          label: 'Font',
          stateSignal: this.fontService.font,
          stateOptions: this.fontOptions,
          setState: (value: FontPreset) => this.fontService.setFont(value as FontPreset),
          tooltip: 'Change font (Alt + B + < / Alt + B + >)'
        }
      }
    ] as MenuItem[];
  }

  closeMenu() {
    this.menuService.closeMenu();
  }
}
