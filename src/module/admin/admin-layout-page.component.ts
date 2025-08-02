import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Component, inject, viewChild } from '@angular/core';
import { HeaderComponent } from '../../app/component/layout/header/header.component';
import { FooterComponent } from '../../app/component/layout/footer/footer.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { DrawerMode, LayoutService } from '../../app/component/layout/_service/layout.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-admin-layout-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    HeaderComponent,
    FooterComponent,
    MatSidenavModule,
    MatSlideToggleModule
  ],
  templateUrl: './admin-layout-page.component.html',
  styleUrls: ['./admin-layout-page.component.scss']
})
export class AdminLayoutPageComponent {
  layoutService = inject(LayoutService);
  drawer = viewChild<MatSidenav>('drawer');
  drawerOpenedSignal = this.layoutService.drawerOpenedSignal;
  drawerModeSignal = this.layoutService.drawerModeSignal;
  drawerPositionSignal = this.layoutService.drawerPositionSignal;

  // Admin-specific navigation items
  adminNavItems = [
    {
      label: 'Users',
      icon: 'group',
      route: '/admin/user',
      description: 'Manage user accounts and permissions'
    },
    {
      label: 'Quizzes',
      icon: 'quiz',
      route: '/admin/quiz',
      description: 'Create and manage quizzes'
    }
  ];

  constructor() {
    this.layoutService.toggleDrawerMode(DrawerMode.Over);
  }

  get drawerOpened() {
    return this.drawerOpenedSignal();
  }

  toggleDrawer() {
    this.layoutService.toggleDrawer();
  }

  toggleDrawerMode() {
    this.layoutService.toggleDrawerMode();
  }

  toggleDrawerPosition() {
    this.layoutService.toggleDrawerPosition();
  }

  // Admin-specific methods
  onNavItemClick(item: any) {
    console.log(`Navigating to: ${item.route}`);
    this.toggleDrawer(); // Close drawer after navigation on mobile
  }

  getCurrentUserRole(): string {
    // TODO: Implement user role detection from auth service
    return 'Administrator';
  }
}
