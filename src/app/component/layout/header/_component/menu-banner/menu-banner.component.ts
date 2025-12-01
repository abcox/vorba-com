import { CommonModule } from "@angular/common";
import { Component, signal, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule, Router } from "@angular/router";
import { LogoComponent } from "../logo/logo.component";

export interface MenuItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-menu-banner',
  standalone: true,
  imports: [LogoComponent, CommonModule, MatButtonModule, RouterModule],
  templateUrl: './menu-banner.component.html',
  styleUrl: './menu-banner.component.scss'
})
export class MenuBannerComponent {
    private router = inject(Router);
    
    menuList = signal([
        //{ label: 'Solutions', url: '/solutions' },
        { label: 'Services', url: '/services' },
        { label: 'Pricing', url: '/pricing' },
        //{ label: 'Resources', url: '/resources' },
        { label: 'Our Work', url: '/case-studies' },
        { label: 'Company', url: '/about' },
    ] as MenuItem[])
    isDialogVisible = signal(false);
    selectedMenuItem = signal<MenuItem | undefined>(undefined);
    hideDialogTimeout: ReturnType<typeof setTimeout> | null = null;

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