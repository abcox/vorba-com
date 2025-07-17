import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

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
  ],
  template: `
  <app-header></app-header>
  <div class="content">
    <router-outlet />
  </div>
  <app-footer></app-footer>
  `
})
export class NavLayoutPageComponent {}
