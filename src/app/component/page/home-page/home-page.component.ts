import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { YouTubePlayer } from '@angular/youtube-player';
import { DomSanitizer } from '@angular/platform-browser';
import { SocialMediaLinksComponent } from '../../layout/_component/social-media-links/social-media-links.component';
import { LayoutService } from '../../layout/_service/layout.service';
import { of } from 'rxjs';
import { CarouselComponent, CarouselOptions, DEFAULT_CAROUSEL_AUTOPLAY_OPTIONS } from '../../carousel/carousel.component';
import { MatButtonModule } from '@angular/material/button';
import { ClientLogoSectionComponent } from "./_component/client-logo/client-logo-section.component";
import { ContactFormComponent, ContactFormOptions, ContactFormPanelOrder } from '../../forms/contact-form/contact-form.component';
import { DialogModule } from "@angular/cdk/dialog";
import { TestamonySectionComponent } from '../../section/testamony-section/testamony-section.component';
//import { HotkeyDirective } from '../../../directive/hotkey-directive/hotkey.directive';
import { HotkeyDirective } from "src/app/directive/hotkey-directive";

interface OfferAction {
  label: string;
  callback: () => void;
}

interface OfferViewModel {
  title: string;
  description: string;
  action?: OfferAction;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatButtonToggleModule,
    MatCardModule, MatIconModule, MatSlideToggleModule,
    YouTubePlayer, RouterModule,
    SocialMediaLinksComponent,
    CarouselComponent,
    ClientLogoSectionComponent,
    ContactFormComponent,
    DialogModule,
    TestamonySectionComponent,
    HotkeyDirective
],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  //encapsulation: ViewEncapsulation.None
})
export class HomePageComponent {
  sanitizer = inject(DomSanitizer);
  layoutService = inject(LayoutService);
  title = 'Software Consulting';
  //theme = 'dark';
  isLightTheme = computed(() => this.layoutService.themeSignal() === 'light');

  placeholderImageQuality: 'high' | 'low' | 'standard' = 'standard';
  shorts$ = of<any[]>([
    {
      videoId: 'fS4cH2fky5M',
    },
    {
      videoId: 'mVjYG9TSN88',
    },
  ]);

  contactFormOptions = signal<ContactFormOptions>({
    panelOrder: ContactFormPanelOrder.FormFirst,
  });

  //overlayContainer = inject(OverlayContainer);

  carouselOptions: CarouselOptions = {
    autoplay: {
      ...DEFAULT_CAROUSEL_AUTOPLAY_OPTIONS,
      delayMs: 12000,
    },
    navigation: false,
    showAutoplayProgress: false
  };

  offers = signal<OfferViewModel[]>([
    {
      title: 'Your High Tech Partner',
      description: 'Partner with trusted, experienced professionals to increase your confidence and business success.',
      action: {
        label: 'Learn More',
        callback: () => {
          console.log('Learn more about High Tech Partner');
        }
      }
    },
    {
      title: 'Your Software Solutions Team',
      description: 'Team capable of building beautiful, performant, and sexy software solutions tailored to scale your business.',
      action: {
        label: 'Contact Us',
        callback: () => {
          console.log('Contact Us');
        }
      }
    },
    {
      title: 'Your Growth Leader',
      description: 'Update legacy systems and remove a massive barrier to growth.',
      action: {
        label: 'Case Studies',
        callback: () => {
          console.log('View Case Studies');
        }
      }
    },
  ]);

  constructor() {
    //this.applyTheme('dark-theme');
    this.layoutService.clearTitlePrefix();
  }

  toggleThemeHotkey = (): void => {
    this.layoutService.toggleTheme();
  }

  toggleTheme2(event: any): void {
    const isDarkTheme = event.value === 'dark'
    const themeClass = isDarkTheme ? 'dark-theme' : 'light-theme';
    this.applyTheme(themeClass);
  }
  /* toggleTheme(isLight: boolean) {
    this.isLightTheme = isLight;
    if (isLight) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  } */

  applyTheme(themeClass: string) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(themeClass);

    //this.overlayContainer.getContainerElement().classList.remove('light-theme', 'dark-theme');
    //this.overlayContainer.getContainerElement().classList.add(themeClass);
  }
}
