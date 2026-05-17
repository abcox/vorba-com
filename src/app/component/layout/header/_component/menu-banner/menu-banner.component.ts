import { CommonModule } from "@angular/common";
import { Component, signal, inject, computed } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule, Router } from "@angular/router";
import { LogoComponent } from "../logo/logo.component";
import { MenuToggleComponent } from "../menu-toggle/menu-toggle.component";
import { MenuDialogComponent } from "../menu-dialog/menu-dialog.component";
import { DeviceService } from "@src/app/services/device.service";

export interface MenuItem {
    label: string;
    url?: string;
    routerLink?: string; // todo: unify url vs routerLink usage across the app
}

@Component({
  selector: 'app-menu-banner',
  standalone: true,
  imports: [LogoComponent, CommonModule, MatButtonModule, RouterModule,
    MenuToggleComponent, MenuDialogComponent
  ],
  templateUrl: './menu-banner.component.html',
  styleUrl: './menu-banner.component.scss'
})
export class MenuBannerComponent {
    private router = inject(Router);
    private deviceService = inject(DeviceService);
    
    isMobile = this.deviceService.isMobile;
    menuList = signal([
        //{ label: 'Solutions', url: '/solutions' },
        { label: 'Services', url: '/services', routerLink: '/services' },
        { label: 'Offers', url: '/offers', routerLink: '/offers' },
        //{ label: 'Resources', url: '/resources' },
        { label: 'Our Work', url: '/case-studies', routerLink: '/case-studies' },
        { label: 'About Us', url: '/about', routerLink: '/about' },
    ] as MenuItem[])
    isDialogVisible = signal(false);
    selectedMenuItem = signal<MenuItem | undefined>(undefined);
    hideDialogTimeout: ReturnType<typeof setTimeout> | null = null;
    menuListForDisplay = computed(() => {
        const list = this.menuList();
        if (this.isMobile()) {
            return [];
        }
        return list;
    });

    constructor() {
        //this.selectedMenuItem.set(this.menuList()[0]);
    }

    hideDialog() {
        this.scheduleDialogVisibility();
    }

    showDialog(menuItem?: MenuItem) {
        this.scheduleDialogVisibility(menuItem);
    }

    cancelDialogVisibilitySchedule() {
        if (this.hideDialogTimeout) {
            clearTimeout(this.hideDialogTimeout);
            this.hideDialogTimeout = null;
        }
    }

    navigateHome() {
        this.router.navigate(['/']);
    }
        
    private scheduleDialogVisibility(menuItem?: MenuItem | undefined) {
        this.hideDialogTimeout = setTimeout(() => {
            if (menuItem) {
                this.selectedMenuItem.set(menuItem);
            } else {
                this.selectedMenuItem.set(undefined);
            }
            this.hideDialogTimeout = null;
        }, 200); // 200ms grace period
    }
}