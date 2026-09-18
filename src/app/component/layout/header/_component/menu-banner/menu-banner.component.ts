import { CommonModule } from "@angular/common";
import { Component, signal, inject, computed } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule, Router } from "@angular/router";
import { LogoComponent } from "../logo/logo.component";
import { MenuToggleComponent } from "../menu-toggle/menu-toggle.component";
import { MenuDialogComponent } from "../menu-dialog/menu-dialog.component";
import { DeviceService } from "@src/app/services/device.service";
import { MenuItem } from "../menu-list/menu-list.component";
import { PaymentCartStatusComponent } from '@src/app/module/payment/component/payment-cart-status/payment-cart-status.component';
import { AuthService } from '@src/app/core/auth/auth.service';
import { DialogService } from '@src/app/component/dialog/dialog.service';
//import { MenuItem } from "@src/app/app.routes"

@Component({
  selector: 'app-menu-banner',
  standalone: true,
  imports: [LogoComponent, CommonModule, MatButtonModule, RouterModule,
        MenuToggleComponent, MenuDialogComponent, PaymentCartStatusComponent
  ],
  templateUrl: './menu-banner.component.html',
  styleUrl: './menu-banner.component.scss'
})
export class MenuBannerComponent {
    private router = inject(Router);
    private deviceService = inject(DeviceService);
    private authService = inject(AuthService);
    private dialogService = inject(DialogService);
    
    readonly isAuthenticated = this.authService.isAuthenticated;
    
    isMobile = this.deviceService.isMobile;
    menuList = signal<MenuItem[]>([
        //{ label: 'Solutions', url: '/solutions' },
        { label: 'Services', routerLink: '/services', icon: 'build' },
        { label: 'Offers', routerLink: '/offers', icon: 'local_offer' },
        //{ label: 'Resources', url: '/resources' },
        //{ label: 'Our Work', url: '/case-studies', routerLink: '/case-studies' },
        { label: 'About Us', routerLink: '/about', icon: 'info' },
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
    cartCount = computed(() => this.getCartItemCountFromStorage());

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

    openSignInDialog(): void {
        this.dialogService.openGeneralLoginDialog(this.router.url).subscribe();
    }

    private getCartItemCountFromStorage(): number {
        const keys = ['payment-cart-items', 'paymentCartItems', 'paymentCheckoutDraft'];

        for (const key of keys) {
            const raw = localStorage.getItem(key);
            if (!raw) {
                continue;
            }

            try {
                const parsed = JSON.parse(raw) as unknown;
                if (Array.isArray(parsed)) {
                    return parsed.length;
                }

                if (parsed && typeof parsed === 'object') {
                    const maybeItems = (parsed as { items?: unknown }).items;
                    if (Array.isArray(maybeItems)) {
                        return maybeItems.length;
                    }
                }
            } catch {
                // Ignore malformed localStorage payloads.
            }
        }

        return 0;
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