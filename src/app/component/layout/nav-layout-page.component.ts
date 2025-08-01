import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';
import { Component, inject, viewChild } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { LayoutService } from './_service/layout.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-nav-layout-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    HeaderComponent,
    FooterComponent,
    MatSidenavModule,
    MatSlideToggleModule
  ],
  templateUrl: './nav-layout-page.component.html',
})
export class NavLayoutPageComponent {
  layoutService = inject(LayoutService);
  drawer = viewChild<MatSidenav>('drawer');
  drawerOpenedSignal = this.layoutService.drawerOpenedSignal;
  drawerModeSignal = this.layoutService.drawerModeSignal;
  drawerPositionSignal = this.layoutService.drawerPositionSignal;

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
}
