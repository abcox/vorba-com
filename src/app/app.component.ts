import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonToggleModule, MatCardModule, MatIconModule, MatSlideToggleModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Vorba';
  //theme = 'dark';
  isLightTheme = false;

  overlayContainer = inject(OverlayContainer);

  toggleTheme2(event: any): void {
    const isDarkTheme = event.value === 'dark'
    const themeClass = isDarkTheme ? 'dark-theme' : 'light-theme';
    this.applyTheme(themeClass);
  }
  toggleTheme(isLight: boolean) {
    this.isLightTheme = isLight;
    if (isLight) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }

  applyTheme(themeClass: string) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(themeClass);

    this.overlayContainer.getContainerElement().classList.remove('light-theme', 'dark-theme');
    this.overlayContainer.getContainerElement().classList.add(themeClass);
  }
}
